import { Router, Request, Response } from 'express';
import { db, sqlite } from '../db';
import { users, providerProfiles, providerServices, serviceAreas, providerImages, serviceCategories, serviceRequests, leads, adminNotes, contactMessages } from '../db/schema';
import { eq, desc, like, and, sql } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { notifyUser, getAllNotifications } from '../services/notifications';

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

// ── Helper: generate display_id from request id + created_at ─────────
function makeDisplayId(id: number, createdAt: string): string {
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  return `MWR-${year}${String(id).padStart(4, '0')}`;
}

// ── GET /api/admin/dashboard ───────────────────────────────────────
router.get('/dashboard', (_req: Request, res: Response) => {
  const totalUsers = db.select().from(users).all().length;
  const totalCustomers = db.select().from(users).where(eq(users.role, 'customer')).all().length;
  const totalProviders = db.select().from(users).where(eq(users.role, 'provider')).all().length;
  const pendingProviders = db.select().from(providerProfiles).where(eq(providerProfiles.approval_status, 'pending_review')).all().length;

  res.json({
    stats: {
      totalUsers,
      totalCustomers,
      totalProviders,
      pendingProviders,
    },
  });
});

// ── GET /api/admin/users ───────────────────────────────────────────
router.get('/users', (_req: Request, res: Response) => {
  const allUsers = db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    status: users.status,
    created_at: users.created_at,
  }).from(users).all();

  res.json({ users: allUsers });
});

// ── GET /api/admin/providers/pending ────────────────────────────────
router.get('/providers/pending', (_req: Request, res: Response) => {
  const pending = db.select().from(providerProfiles).where(
    eq(providerProfiles.approval_status, 'pending_review')
  ).all();
  res.json({ providers: pending });
});

// ── GET /api/admin/providers ────────────────────────────────────────
// Returns ALL provider profiles with user info, services, and areas
router.get('/providers', (_req: Request, res: Response) => {
  try {
    const allProviders = db.select().from(providerProfiles).all();

    const enriched = allProviders.map((p) => {
      const user = db.select({ name: users.name, email: users.email })
        .from(users).where(eq(users.id, p.user_id)).get();

      const services = db.select({
        name: serviceCategories.name,
        category_id: serviceCategories.id,
      }).from(providerServices)
        .innerJoin(serviceCategories, eq(providerServices.category_id, serviceCategories.id))
        .where(eq(providerServices.provider_id, p.id))
        .all();

      const areas = db.select()
        .from(serviceAreas)
        .where(eq(serviceAreas.provider_id, p.id))
        .all();

      const images = db.select()
        .from(providerImages)
        .where(eq(providerImages.provider_id, p.id))
        .all();

      return {
        ...p,
        user_name: user?.name || '',
        user_email: user?.email || '',
        services,
        areas,
        images,
      };
    });

    res.json({ providers: enriched });
  } catch (err: any) {
    console.error('GET /api/admin/providers error:', err);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// ── POST /api/admin/providers/:id/status ───────────────────────────
// Unified status update: approve, reject, publish, unpublish, suspend, request_changes
router.post('/providers/:id/status', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid provider ID' });
      return;
    }

    const { status } = req.body;
    const validStatuses = ['pending_review', 'published', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const provider = db.select().from(providerProfiles).where(eq(providerProfiles.id, id)).get();
    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    db.update(providerProfiles)
      .set({ approval_status: status, updated_at: new Date().toISOString() })
      .where(eq(providerProfiles.id, id))
      .run();

    // Notify the provider
    const statusMessages: Record<string, { title: string; message: string }> = {
      published: {
        title: `Profile Published — ${provider.business_name}`,
        message: `Your business "${provider.business_name}" is now live on MadeWayHomes! Customers can find and request your services.`,
      },
      rejected: {
        title: `Application Update — ${provider.business_name}`,
        message: `Your application for "${provider.business_name}" was not approved. Please contact us for more information.`,
      },
      pending_review: {
        title: `Profile Under Review — ${provider.business_name}`,
        message: `Your profile "${provider.business_name}" has been moved back to review. We'll be in touch.`,
      },
    };

    const msg = statusMessages[status];
    if (msg) {
      notifyUser(provider.user_id, `application_${status}`, msg.title, msg.message, { provider_id: id });
    }

    const updated = db.select().from(providerProfiles).where(eq(providerProfiles.id, id)).get();
    res.json({ provider: updated });
  } catch (err: any) {
    console.error('POST /api/admin/providers/:id/status error:', err);
    res.status(500).json({ error: 'Failed to update provider status' });
  }
});

// ── POST /api/admin/providers/:id/verify ────────────────────────────
router.post('/providers/:id/verify', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid provider ID' });
      return;
    }

    const provider = db.select().from(providerProfiles).where(eq(providerProfiles.id, id)).get();
    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    const { verified } = req.body; // true or false
    db.update(providerProfiles)
      .set({ is_verified: verified ? 1 : 0, updated_at: new Date().toISOString() })
      .where(eq(providerProfiles.id, id))
      .run();

    const updated = db.select().from(providerProfiles).where(eq(providerProfiles.id, id)).get();
    res.json({ provider: updated });
  } catch (err: any) {
    console.error('POST /api/admin/providers/:id/verify error:', err);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

// ── DELETE /api/admin/providers/:id ──────────────────────────────────
router.delete('/providers/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid provider ID' });
      return;
    }

    const provider = db.select().from(providerProfiles).where(eq(providerProfiles.id, id)).get();
    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    db.delete(providerProfiles).where(eq(providerProfiles.id, id)).run();
    res.json({ success: true, message: 'Provider deleted' });
  } catch (err: any) {
    console.error('DELETE /api/admin/providers/:id error:', err);
    res.status(500).json({ error: 'Failed to delete provider' });
  }
});

// ── PUT /api/admin/providers/:id ────────────────────────────────────
router.put('/providers/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid provider ID' });
      return;
    }

    const provider = db.select().from(providerProfiles).where(eq(providerProfiles.id, id)).get();
    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    const { business_name, description, phone, email, website, facebook, instagram, years_in_business, licensed, insured, license_number, custom_other_service } = req.body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (business_name !== undefined) updates.business_name = business_name;
    if (description !== undefined) updates.description = description;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (website !== undefined) updates.website = website;
    if (facebook !== undefined) updates.facebook = facebook;
    if (instagram !== undefined) updates.instagram = instagram;
    if (years_in_business !== undefined) updates.years_in_business = years_in_business;
    if (licensed !== undefined) updates.licensed = licensed;
    if (insured !== undefined) updates.insured = insured;
    if (license_number !== undefined) updates.license_number = license_number;
    if (custom_other_service !== undefined) updates.custom_other_service = custom_other_service;

    db.update(providerProfiles).set(updates).where(eq(providerProfiles.id, id)).run();

    const updated = db.select().from(providerProfiles).where(eq(providerProfiles.id, id)).get();
    res.json({ provider: updated });
  } catch (err: any) {
    console.error('PUT /api/admin/providers/:id error:', err);
    res.status(500).json({ error: 'Failed to update provider' });
  }
});

// ── GET /api/admin/requests ──────────────────────────────────────
router.get('/requests', (_req: Request, res: Response) => {
  try {
    const all = db.select().from(serviceRequests).orderBy(desc(serviceRequests.created_at)).all();

    const enriched = all.map((r) => {
      const customer = db.select({ name: users.name, email: users.email, phone: users.phone })
        .from(users).where(eq(users.id, r.customer_id)).get();

      const cat = db.select({ name: serviceCategories.name })
        .from(serviceCategories).where(eq(serviceCategories.id, r.category_id)).get();

      return {
        id: r.id,
        display_id: makeDisplayId(r.id, r.created_at),
        category_name: cat?.name || '',
        city: r.city,
        zip_code: r.zip_code,
        description: r.description,
        budget_min: r.budget_min,
        budget_max: r.budget_max,
        preferred_date: r.preferred_date,
        contact_preference: r.contact_preference,
        status: r.status,
        customer_name: customer?.name || '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        created_at: r.created_at,
      };
    });

    res.json({ requests: enriched });
  } catch (err: any) {
    console.error('GET /api/admin/requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ── PUT /api/admin/requests/:id ───────────────────────────────────
router.put('/requests/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid request ID' });
      return;
    }

    const existing = db.select().from(serviceRequests).where(eq(serviceRequests.id, id)).get();
    if (!existing) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const { status, city, zip_code, preferred_date, description } = req.body;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (status !== undefined) updates.status = status;
    if (city !== undefined) updates.city = city;
    if (zip_code !== undefined) updates.zip_code = zip_code;
    if (preferred_date !== undefined) updates.preferred_date = preferred_date;
    if (description !== undefined) updates.description = description;

    db.update(serviceRequests).set(updates).where(eq(serviceRequests.id, id)).run();

    const updated = db.select().from(serviceRequests).where(eq(serviceRequests.id, id)).get();
    res.json({ request: { ...updated, display_id: makeDisplayId(updated!.id, updated!.created_at) } });
  } catch (err: any) {
    console.error('PUT /api/admin/requests/:id error:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// ── POST /api/admin/requests/:id/match ────────────────────────────
router.post('/requests/:id/match', (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      res.status(400).json({ error: 'Invalid request ID' });
      return;
    }

    const providerId = parseInt(req.body.provider_id);
    if (isNaN(providerId)) {
      res.status(400).json({ error: 'Invalid provider ID' });
      return;
    }

    // Validate request exists
    const request = db.select().from(serviceRequests).where(eq(serviceRequests.id, requestId)).get();
    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    // Validate provider exists and is approved
    const provider = db.select().from(providerProfiles).where(eq(providerProfiles.id, providerId)).get();
    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }
    if (provider.approval_status !== 'published') {
      res.status(400).json({ error: 'Provider must be published before matching' });
      return;
    }

    // Ensure leads table exists
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
        provider_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','matched','available','purchased','contacted','scheduled','completed','canceled','refunded','disputed')),
        purchased_at TEXT,
        price_cents INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Create lead
    const result = db.insert(leads).values({
      request_id: requestId,
      provider_id: providerId,
      status: 'matched',
    }).returning().get();

    // Update request status to matched
    db.update(serviceRequests)
      .set({ status: 'matched', updated_at: new Date().toISOString() })
      .where(eq(serviceRequests.id, requestId))
      .run();

    // Get category name for notification
    const category = db.select({ name: serviceCategories.name })
      .from(serviceCategories)
      .where(eq(serviceCategories.id, request.category_id))
      .get();

    // Notify the matched provider
    notifyUser(
      provider.user_id,
      'new_lead',
      `New Lead — ${category?.name || 'Service'} request in ${request.city}`,
      `You've been matched with a ${category?.name || 'service'} request in ${request.city}. Check your dashboard for details!`,
      { request_id: requestId, lead_id: result.id }
    );

    res.json({ lead: result, message: 'Request matched to provider' });
  } catch (err: any) {
    console.error('POST /api/admin/requests/:id/match error:', err);
    res.status(500).json({ error: 'Failed to match request' });
  }
});

// ── GET /api/admin/requests/:id/notes ─────────────────────────────
router.get('/requests/:id/notes', (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      res.status(400).json({ error: 'Invalid request ID' });
      return;
    }

    const notes = db.select({
      id: adminNotes.id,
      note: adminNotes.note,
      admin_id: adminNotes.admin_id,
      created_at: adminNotes.created_at,
      admin_name: users.name,
    })
    .from(adminNotes)
    .leftJoin(users, eq(adminNotes.admin_id, users.id))
    .where(and(
      eq(adminNotes.target_type, 'request'),
      eq(adminNotes.target_id, requestId),
    ))
    .orderBy(desc(adminNotes.created_at))
    .all();

    res.json({ notes });
  } catch (err: any) {
    console.error('GET /api/admin/requests/:id/notes error:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// ── POST /api/admin/requests/:id/notes ────────────────────────────
router.post('/requests/:id/notes', (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      res.status(400).json({ error: 'Invalid request ID' });
      return;
    }

    const { note } = req.body;
    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      res.status(400).json({ error: 'Note content is required' });
      return;
    }

    // Ensure admin_notes table exists
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS admin_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        target_type TEXT NOT NULL CHECK(target_type IN ('request','provider','user')),
        target_id INTEGER NOT NULL,
        note TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    const result = db.insert(adminNotes).values({
      admin_id: req.user!.userId,
      target_type: 'request',
      target_id: requestId,
      note: note.trim(),
    }).returning().get();

    res.status(201).json({ note: result });
  } catch (err: any) {
    console.error('POST /api/admin/requests/:id/notes error:', err);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// ── GET /api/admin/export/requests ────────────────────────────────
router.get('/export/requests', (_req: Request, res: Response) => {
  try {
    const all = db.select().from(serviceRequests).orderBy(desc(serviceRequests.created_at)).all();

    const header = 'ID,Display ID,Category,City,Status,Customer Name,Customer Email,Customer Phone,Description,Budget Min,Budget Max,Preferred Date,Created At';
    const rows = all.map((r) => {
      const customer = db.select({ name: users.name, email: users.email, phone: users.phone })
        .from(users).where(eq(users.id, r.customer_id)).get();
      const cat = db.select({ name: serviceCategories.name })
        .from(serviceCategories).where(eq(serviceCategories.id, r.category_id)).get();

      const esc = (v: any) => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
      };

      return [
        esc(r.id),
        esc(makeDisplayId(r.id, r.created_at)),
        esc(cat?.name || ''),
        esc(r.city),
        esc(r.status),
        esc(customer?.name || ''),
        esc(customer?.email || ''),
        esc(customer?.phone || ''),
        esc(r.description),
        esc(r.budget_min),
        esc(r.budget_max),
        esc(r.preferred_date),
        esc(r.created_at),
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="requests.csv"');
    res.send(csv);
  } catch (err: any) {
    console.error('GET /api/admin/export/requests error:', err);
    res.status(500).json({ error: 'Failed to export requests' });
  }
});

// ── GET /api/admin/export/providers ───────────────────────────────
router.get('/export/providers', (_req: Request, res: Response) => {
  try {
    const all = db.select().from(providerProfiles).orderBy(desc(providerProfiles.created_at)).all();

    const header = 'ID,Business Name,Status,Contact Name,Email,Phone,Services,Areas,Created At';
    const rows = all.map((p) => {
      const user = db.select({ name: users.name, email: users.email })
        .from(users).where(eq(users.id, p.user_id)).get();

      const services = db.select({ name: serviceCategories.name })
        .from(providerServices)
        .innerJoin(serviceCategories, eq(providerServices.category_id, serviceCategories.id))
        .where(eq(providerServices.provider_id, p.id))
        .all()
        .map(s => s.name)
        .join('; ');

      const areas = db.select()
        .from(serviceAreas)
        .where(eq(serviceAreas.provider_id, p.id))
        .all()
        .map(a => `${a.city}, ${a.state}`)
        .join('; ');

      const esc = (v: any) => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
      };

      return [
        esc(p.id),
        esc(p.business_name),
        esc(p.approval_status),
        esc(user?.name || ''),
        esc(user?.email || ''),
        esc(p.phone),
        esc(services),
        esc(areas),
        esc(p.created_at),
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="providers.csv"');
    res.send(csv);
  } catch (err: any) {
    console.error('GET /api/admin/export/providers error:', err);
    res.status(500).json({ error: 'Failed to export providers' });
  }
});

// ── GET /api/admin/contact-messages ───────────────────────────────
router.get('/contact-messages', (_req: Request, res: Response) => {
  try {
    // Ensure table exists
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    const messages = db.select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.created_at))
      .all();

    res.json({ messages });
  } catch (err: any) {
    console.error('GET /api/admin/contact-messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ── GET /api/admin/notifications ──────────────────────────────────
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const notifications = await getAllNotifications(limit);

    res.json({ notifications });
  } catch (err: any) {
    console.error('GET /api/admin/notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

export default router;
