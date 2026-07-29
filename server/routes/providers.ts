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
const publicUploadsDir = path.resolve(__dirname, '../../data/uploads/public');
const credentialsDir = path.resolve(__dirname, '../../data/uploads/credentials');
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}
if (!fs.existsSync(credentialsDir)) {
  fs.mkdirSync(credentialsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // Credential documents go to a private directory not served as static files
    if (file.fieldname === 'credential_document') {
      cb(null, credentialsDir);
    } else {
      cb(null, publicUploadsDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const CREDENTIAL_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'credential_document') {
    if (CREDENTIAL_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Credential document must be PDF, JPG, PNG, or WebP'));
    }
  } else if (ALLOWED_MIMES.includes(file.mimetype)) {
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
    files: 12, // 1 logo + up to 10 work photos + 1 credential doc
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
      approval_status TEXT NOT NULL DEFAULT 'pending_review' CHECK(approval_status IN ('pending_review','published','rejected')),
      is_verified INTEGER NOT NULL DEFAULT 0,
      licensed TEXT DEFAULT 'not_applicable' CHECK(licensed IN ('yes','no','not_applicable')),
      insured TEXT DEFAULT 'no' CHECK(insured IN ('yes','no')),
      credential_document_path TEXT,
      custom_other_service TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Migrate: add columns if they don't exist ─────────────────
  try { sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN license_number TEXT'); } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }
  try { sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN insurance_provider TEXT'); } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }
  try { sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN insurance_policy_number TEXT'); } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }
  try { sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 0'); } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }
  try { sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN licensed TEXT DEFAULT \'not_applicable\''); } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }
  try { sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN insured TEXT DEFAULT \'no\''); } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }
  try { sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN credential_document_path TEXT'); } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }
  try { sqlite.exec('ALTER TABLE provider_profiles ADD COLUMN custom_other_service TEXT'); } catch (e: any) { if (!e.message.includes('duplicate column')) throw e; }

  // ── Migrate: update approval_status CHECK to include new statuses ──
  try {
    // Recreate table is risky, instead just update existing 'pending' to 'pending_review'
    sqlite.exec("UPDATE provider_profiles SET approval_status = 'pending_review' WHERE approval_status = 'pending'");
  } catch (e: any) { /* ignore */ }

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
  owner_name: z.string().min(1, 'Owner/contact name is required').max(100),
  phone: z.string().min(1, 'Phone number is required').max(30),
  email: z.string().email('Valid email is required').max(255),
  website: z.string().max(500).optional().nullable().or(z.literal('')),
  facebook: z.string().max(500).optional().nullable().or(z.literal('')),
  instagram: z.string().max(500).optional().nullable().or(z.literal('')),
  years_in_business: z.coerce.number().int().positive().optional().nullable(),
  licensed: z.enum(['yes', 'no', 'not_applicable']).default('not_applicable'),
  insured: z.enum(['yes', 'no']).default('no'),
  license_number: z.string().max(100).optional().nullable().or(z.literal('')),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  service_categories: z.string().min(1, 'At least one service category is required'), // JSON array string
  service_areas: z.string().min(1, 'At least one service area is required'), // JSON array string
  custom_other_service: z.string().max(200).optional().nullable().or(z.literal('')),
  terms_agreed: z.string().transform(val => val === 'true' || val === '1'),
  accuracy_agreed: z.string().transform(val => val === 'true' || val === '1'),
});

// ── POST /api/providers/apply ─────────────────────────────────────────
router.post('/apply', requireAuth, (req: Request, res: Response, next) => {
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
    { name: 'credential_document', maxCount: 1 },
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
      res.status(400).json({ error: 'You must agree to the Provider Agreement, Privacy Policy, and Terms of Service' });
      return;
    }

    if (!data.accuracy_agreed) {
      res.status(400).json({ error: 'You must confirm the accuracy of your information' });
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

    // ── Handle logo and credential upload ──────────────────────────
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    let logoUrl: string | null = null;
    let credentialDocPath: string | null = null;

    if (files?.logo && files.logo.length > 0) {
      logoUrl = `/uploads/${files.logo[0].filename}`;
    }

    if (files?.credential_document && files.credential_document.length > 0) {
      // Store filesystem path (not URL) — credentials are not publicly served
      credentialDocPath = `data/uploads/credentials/${files.credential_document[0].filename}`;
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
      licensed: data.licensed || 'not_applicable',
      insured: data.insured || 'no',
      credential_document_path: credentialDocPath,
      custom_other_service: data.custom_other_service || null,
      approval_status: 'pending_review',
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
      message: 'Application received. MadeWayHomes will review your business information before publishing your profile. We may contact you if additional information is needed.',
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
    const conditions: string[] = ["p.approval_status = 'published'"];
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
      SELECT DISTINCT p.id, p.business_name, p.description, p.logo_url,
        p.phone, p.email, p.website, p.facebook, p.instagram,
        p.years_in_business, p.is_verified
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

      // Build explicit allowlist — only public fields
      return {
        id: p.id,
        business_name: p.business_name,
        description: p.description,
        logo_url: p.logo_url,
        phone: p.phone,
        email: p.email,
        website: p.website,
        facebook: p.facebook,
        instagram: p.instagram,
        years_in_business: p.years_in_business,
        is_verified: p.is_verified,
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

    if (provider.approval_status !== 'published') {
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

    // Build explicit allowlist — only public fields
    const pub = provider as any;

    res.json({
      provider: {
        id: pub.id,
        business_name: pub.business_name,
        description: pub.description,
        logo_url: pub.logo_url,
        phone: pub.phone,
        email: pub.email,
        website: pub.website,
        facebook: pub.facebook,
        instagram: pub.instagram,
        years_in_business: pub.years_in_business,
        is_verified: pub.is_verified,
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
