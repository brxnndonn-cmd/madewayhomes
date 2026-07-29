import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { db, sqlite } from '../db';
import { providerProfiles, providerServices, serviceAreas, providerImages, serviceCategories } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { notifyUser, notifyAdmin } from '../services/notifications';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// ── Multer Configuration ──────────────────────────────────────────────
const uploadsDir = path.resolve(__dirname, '../../data/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB each
    files: 11, // 1 logo + up to 10 work photos
  },
});

// ── Ensure tables exist ───────────────────────────────────────────────
function ensureTables() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS provider_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      business_name TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      facebook TEXT,
      instagram TEXT,
      years_in_business INTEGER,
      license_number TEXT,
      insurance_provider TEXT,
      insurance_policy_number TEXT,
      business_hours TEXT,
      approval_status TEXT NOT NULL DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Migrate: add columns if they don't exist ─────────────────
  try {
    sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN license_number TEXT');
  } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }
  try {
    sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN insurance_provider TEXT');
  } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }
  try {
    sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN insurance_policy_number TEXT');
  } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS provider_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS service_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
      city TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'NC',
      zip_code TEXT
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS provider_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// ── GET /api/providers/me ─────────────────────────────────────────────
router.get('/me', requireAuth, (req: Request, res: Response) => {
  try {
    ensureTables();

    const profile = db.select()
      .from(providerProfiles)
      .where(eq(providerProfiles.user_id, req.user!.userId))
      .get();

    if (!profile) {
      res.json({ profile: null });
      return;
    }

    // Get services
    const services = db.select({
      category_id: providerServices.category_id,
      name: serviceCategories.name,
    })
    .from(providerServices)
    .leftJoin(serviceCategories, eq(providerServices.category_id, serviceCategories.id))
    .where(eq(providerServices.provider_id, profile.id))
    .all();

    // Get areas
    const areas = db.select()
      .from(serviceAreas)
      .where(eq(serviceAreas.provider_id, profile.id))
      .all();

    // Get images
    const images = db.select()
      .from(providerImages)
      .where(eq(providerImages.provider_id, profile.id))
      .all();

    res.json({
      profile: {
        ...profile,
        services,
        areas,
        images,
      },
    });
  } catch (err: any) {
    console.error('GET /api/providers/me error:', err);
    res.status(500).json({ error: 'Failed to fetch provider profile' });
  }
});

// ── Validation Schema ─────────────────────────────────────────────────
const applySchema = z.object({
  business_name: z.string().min(1, 'Business name is required').max(200),
  owner_name: z.string().max(100).optional(),
  phone: z.string().min(1, 'Phone number is required').max(30),
  email: z.string().email('Valid email is required').max(255),
  website: z.string().max(500).optional().nullable(),
  facebook: z.string().max(500).optional().nullable(),
  instagram: z.string().max(500).optional().nullable(),
  years_in_business: z.coerce.number().int().positive().optional().nullable(),
  license_number: z.string().max(100).optional().nullable(),
  insurance_provider: z.string().max(200).optional().nullable(),
  insurance_policy_number: z.string().max(100).optional().nullable(),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  service_categories: z.string().min(1, 'At least one service category is required'), // JSON array string
  service_areas: z.string().min(1, 'At least one service area is required'), // JSON array string
  terms_agreed: z.string().transform(val => val === 'true' || val === '1'),
});

// ── POST /api/providers/apply ─────────────────────────────────────────
router.post('/apply', requireAuth, (req: Request, res: Response, next) => {
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
  ])(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ error: 'Each image must be under 5MB' });
          return;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          res.status(400).json({ error: 'Maximum 10 work photos allowed' });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      if (err.message === 'Only JPG, PNG, and WebP images are allowed') {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'File upload error' });
      return;
    }
    next();
  });
}, (req: Request, res: Response) => {
  try {
    ensureTables();

    // ── Validate fields ─────────────────────────────────────────────
    const parsed = applySchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      res.status(400).json({
        error: firstError.message,
        field: firstError.path.join('.'),
      });
      return;
    }

    const data = parsed.data;

    // Terms must be agreed
    if (!data.terms_agreed) {
      res.status(400).json({ error: 'You must agree to the Provider Agreement and Terms of Service' });
      return;
    }

    // ── Check user doesn't already have a provider profile ──────────
    const existing = db.select()
      .from(providerProfiles)
      .where(eq(providerProfiles.user_id, req.user!.userId))
      .get();

    if (existing) {
      res.status(400).json({ error: 'You have already submitted a provider application' });
      return;
    }

    // ── Parse JSON arrays ───────────────────────────────────────────
    let serviceCategoryIds: number[];
    let areaEntries: { city: string; state: string; zip_code?: string }[];

    try {
      serviceCategoryIds = JSON.parse(data.service_categories);
      areaEntries = JSON.parse(data.service_areas);
    } catch {
      res.status(400).json({ error: 'Invalid service categories or areas format' });
      return;
    }

    if (!Array.isArray(serviceCategoryIds) || serviceCategoryIds.length === 0) {
      res.status(400).json({ error: 'At least one service category is required' });
      return;
    }

    if (!Array.isArray(areaEntries) || areaEntries.length === 0) {
      res.status(400).json({ error: 'At least one service area is required' });
      return;
    }

    // Validate each area
    for (const area of areaEntries) {
      if (!area.city || !area.city.trim()) {
        res.status(400).json({ error: 'Each service area requires a city' });
        return;
      }
    }

    // ── Handle logo upload ──────────────────────────────────────────
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    let logoUrl: string | null = null;

    if (files?.logo && files.logo.length > 0) {
      logoUrl = `/uploads/${files.logo[0].filename}`;
    }

    // ── Create provider profile ─────────────────────────────────────
    const result = db.insert(providerProfiles).values({
      user_id: req.user!.userId,
      business_name: data.business_name,
      description: data.description,
      logo_url: logoUrl,
      phone: data.phone,
      email: data.email,
      website: data.website || null,
      facebook: data.facebook || null,
      instagram: data.instagram || null,
      years_in_business: data.years_in_business ?? null,
      license_number: data.license_number || null,
      insurance_provider: data.insurance_provider || null,
      insurance_policy_number: data.insurance_policy_number || null,
      approval_status: 'pending',
    }).returning().get();

    // ── Create provider services ────────────────────────────────────
    for (const categoryId of serviceCategoryIds) {
      db.insert(providerServices).values({
        provider_id: result.id,
        category_id: categoryId,
      }).run();
    }

    // ── Create service areas ────────────────────────────────────────
    for (const area of areaEntries) {
      db.insert(serviceAreas).values({
        provider_id: result.id,
        city: area.city.trim(),
        state: area.state || 'NC',
        zip_code: area.zip_code || null,
      }).run();
    }

    // ── Handle work photo uploads ───────────────────────────────────
    const savedPhotoUrls: string[] = [];
    if (files?.photos) {
      for (const photo of files.photos) {
        const imageUrl = `/uploads/${photo.filename}`;
        db.insert(providerImages).values({
          provider_id: result.id,
          image_url: imageUrl,
        }).run();
        savedPhotoUrls.push(imageUrl);
      }
    }

    // ── Return success ──────────────────────────────────────────────
    // Send notifications
    notifyAdmin(
      'new_provider_application',
      `New Provider Application — ${data.business_name}`,
      `A new provider application for "${data.business_name}" has been submitted and is pending review.`,
      { provider_id: result.id, business_name: data.business_name }
    );

    notifyUser(
      req.user!.userId,
      'application_submitted',
      `Application Submitted — ${data.business_name}`,
      `We'll review your application for ${data.business_name} and get back to you within 1-2 business days.`,
      { provider_id: result.id, business_name: data.business_name }
    );

    res.status(201).json({
      success: true,
      provider: {
        id: result.id,
        business_name: result.business_name,
        approval_status: result.approval_status,
        logo_url: logoUrl,
        photos: savedPhotoUrls,
        created_at: result.created_at,
      },
      message: 'Thank you! We\'ll review your application and get back to you within 1-2 business days.',
    });
  } catch (err: any) {
    console.error('POST /api/providers/apply error:', err);
    res.status(500).json({ error: 'Failed to submit application. Please try again.' });
  }
});

// ── GET /api/providers (public list) ──────────────────────────────────
router.get('/', (req: Request, res: Response) => {
  try {
    ensureTables();

    const { category, city, search } = req.query;
    const conditions: string[] = ["p.approval_status = 'approved'"];
    const params: any[] = [];

    if (category && String(category).trim()) {
      conditions.push('ps2.category_id = ?');
      params.push(Number(category));
    }

    if (city && String(city).trim()) {
      conditions.push('sa2.city LIKE ?');
      params.push(`%${String(city).trim()}%`);
    }

    if (search && String(search).trim()) {
      conditions.push('(p.business_name LIKE ? OR p.description LIKE ?)');
      const q = `%${String(search).trim()}%`;
      params.push(q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const rows = sqlite.prepare(`
      SELECT DISTINCT p.*
      FROM provider_profiles p
      LEFT JOIN provider_services ps2 ON ps2.provider_id = p.id
      LEFT JOIN service_areas sa2 ON sa2.provider_id = p.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `).all(...params) as any[];

    // For each provider, fetch services, areas, and images
    const providers = rows.map((p: any) => {
      const services = sqlite.prepare(`
        SELECT sc.id, sc.name, sc.icon
        FROM provider_services ps
        JOIN service_categories sc ON sc.id = ps.category_id
        WHERE ps.provider_id = ?
      `).all(p.id);

      const areas = sqlite.prepare(`
        SELECT city, state, zip_code FROM service_areas WHERE provider_id = ?
      `).all(p.id);

      const images = sqlite.prepare(`
        SELECT image_url FROM provider_images WHERE provider_id = ?
      `).all(p.id);

      return {
        ...p,
        services,
        areas,
        images: images.map((img: any) => img.image_url),
      };
    });

    res.json({ providers });
  } catch (err: any) {
    console.error('GET /api/providers error:', err);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// ── GET /api/providers/:id (public single) ───────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  try {
    ensureTables();

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid provider ID' });
      return;
    }

    const provider = db.select()
      .from(providerProfiles)
      .where(eq(providerProfiles.id, id))
      .get();

    if (!provider) {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    if (provider.approval_status !== 'approved') {
      res.status(404).json({ error: 'Provider not found' });
      return;
    }

    // Get services with category details
    const services = db.select({
      id: serviceCategories.id,
      name: serviceCategories.name,
      icon: serviceCategories.icon,
      slug: serviceCategories.slug,
    })
    .from(providerServices)
    .innerJoin(serviceCategories, eq(providerServices.category_id, serviceCategories.id))
    .where(eq(providerServices.provider_id, provider.id))
    .all();

    // Get areas
    const areas = db.select()
      .from(serviceAreas)
      .where(eq(serviceAreas.provider_id, provider.id))
      .all();

    // Get images
    const images = db.select()
      .from(providerImages)
      .where(eq(providerImages.provider_id, provider.id))
      .all();

    res.json({
      provider: {
        ...provider,
        services,
        areas,
        images: images.map((img) => img.image_url),
      },
    });
  } catch (err: any) {
    console.error('GET /api/providers/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

export default router;
