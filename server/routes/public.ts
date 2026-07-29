import { Router, Request, Response } from 'express';
import { db, sqlite } from '../db';
import { providerProfiles, serviceCategories, contactMessages, emailSignups, siteSettings } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// ── GET /api/providers/featured ────────────────────────────────────
router.get('/providers/featured', (_req: Request, res: Response) => {
  try {
    const approved = db.select({
      id: providerProfiles.id,
      business_name: providerProfiles.business_name,
      description: providerProfiles.description,
      logo_url: providerProfiles.logo_url,
      phone: providerProfiles.phone,
      email: providerProfiles.email,
      website: providerProfiles.website,
      years_in_business: providerProfiles.years_in_business,
    })
    .from(providerProfiles)
    .where(eq(providerProfiles.approval_status, 'published'))
    .limit(3)
    .all();

    // Build explicit allowlist — only public fields
    const providers = approved.map(p => ({
      id: p.id,
      business_name: p.business_name,
      description: p.description,
      logo_url: p.logo_url,
      phone: p.phone,
      email: p.email,
      website: p.website,
      years_in_business: p.years_in_business,
    }));

    res.json({ providers });
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to load featured providers. Please try again.' });
  }
});

// ── GET /api/categories ────────────────────────────────────────────
router.get('/categories', (_req: Request, res: Response) => {
  try {
    const categories = db.select({
      id: serviceCategories.id,
      name: serviceCategories.name,
      slug: serviceCategories.slug,
      description: serviceCategories.description,
      icon: serviceCategories.icon,
    })
    .from(serviceCategories)
    .where(eq(serviceCategories.is_active, true))
    .orderBy(asc(serviceCategories.sort_order))
    .all();

    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to load service categories. Please try again.' });
  }
});

// ── POST /api/contact ──────────────────────────────────────────────
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required').max(5000),
});

router.post('/contact', (req: Request, res: Response) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { name, email, subject, message } = parsed.data;

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

    db.insert(contactMessages).values({ name, email, subject, message }).run();

    res.json({ success: true, message: 'Thank you! We\'ll get back to you soon.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

// ── POST /api/email-signup ─────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().email('Valid email is required'),
});

router.post('/email-signup', (req: Request, res: Response) => {
  try {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    // Ensure table exists
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS email_signups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    try {
      db.insert(emailSignups).values({ email: parsed.data.email }).run();
    } catch (e: any) {
      // If duplicate, still say success
      if (!e.message?.includes('UNIQUE')) {
        throw e;
      }
    }

    res.json({ success: true, message: 'You\'re signed up! We\'ll keep you updated.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to sign up. Please try again.' });
  }
});

// ── GET /api/site-settings/:key ────────────────────────────────────
router.get('/site-settings/:key', (req: Request, res: Response) => {
  try {
    const setting = db.select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, req.params.key))
      .get();

    if (!setting) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }

    res.json({ key: req.params.key, value: setting.value });
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to load setting. Please try again.' });
  }
});

// ── GET /api/site-settings (all) ───────────────────────────────────
router.get('/site-settings', (_req: Request, res: Response) => {
  try {
    // Ensure table exists
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    const settings = db.select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings)
      .all();

    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value || '';
    }

    res.json({ settings: map });
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to load settings. Please try again.' });
  }
});

export default router;
