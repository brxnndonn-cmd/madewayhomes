import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { db, sqlite } from '../db';
import { serviceRequests, requestImages, serviceCategories } from '../db/schema';
import { eq } from 'drizzle-orm';
import { optionalAuth } from '../middleware/auth';
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
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
});

// ── Validation Schema ─────────────────────────────────────────────────
const createRequestSchema = z.object({
  category_id: z.coerce.number().int().positive('Please select a service category'),
  city: z.string().min(1, 'City or ZIP code is required').max(100),
  zip_code: z.string().max(20).optional(),
  description: z.string().min(20, 'Please provide at least 20 characters describing your job').max(5000),
  budget_min: z.coerce.number().int().positive().optional().nullable(),
  budget_max: z.coerce.number().int().positive().optional().nullable(),
  preferred_date: z.string().optional().nullable(),
  contact_preference: z.enum(['phone', 'text', 'email']).default('email'),
  customer_name: z.string().min(1, 'Your name is required').max(100),
  customer_phone: z.string().min(1, 'Phone number is required').max(30),
  customer_email: z.string().email('Valid email is required').max(255),
});

// ── Generate display-friendly request ID ──────────────────────────────
function generateRequestId(): string {
  const year = new Date().getFullYear();
  // Count total requests to generate sequential number
  const result = sqlite.prepare('SELECT COUNT(*) as count FROM service_requests').get() as { count: number };
  const nextNum = result.count + 1;
  return `MWR-${year}${String(nextNum).padStart(4, '0')}`;
}

// ── POST /api/service-requests ────────────────────────────────────────
router.post(
  '/',
  optionalAuth,
  (req: Request, res: Response, next) => {
    // Use multer to parse multipart form data
    upload.array('images', 5)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ error: 'Each image must be under 5MB' });
            return;
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            res.status(400).json({ error: 'Maximum 5 images allowed' });
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
  },
  (req: Request, res: Response) => {
    try {
      // ── Auth check ──────────────────────────────────────────────
      if (!req.user) {
        res.status(401).json({
          error: 'Please create an account or log in to submit a service request.',
          requiresAuth: true,
        });
        return;
      }

      // ── Validate fields ─────────────────────────────────────────
      const parsed = createRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        const firstError = parsed.error.errors[0];
        res.status(400).json({
          error: firstError.message,
          field: firstError.path.join('.'),
          details: parsed.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }

      const data = parsed.data;

      // ── Validate category exists and is active ──────────────────
      const category = db.select()
        .from(serviceCategories)
        .where(eq(serviceCategories.id, data.category_id))
        .get();

      if (!category) {
        res.status(400).json({ error: 'Selected service category does not exist' });
        return;
      }

      if (!category.is_active) {
        res.status(400).json({ error: 'Selected service category is not currently available' });
        return;
      }

      // ── Ensure service_requests table exists ────────────────────
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS service_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          category_id INTEGER NOT NULL REFERENCES service_categories(id),
          city TEXT NOT NULL,
          zip_code TEXT,
          description TEXT NOT NULL,
          budget_min INTEGER,
          budget_max INTEGER,
          preferred_date TEXT,
          contact_preference TEXT DEFAULT 'email' CHECK(contact_preference IN ('phone', 'text', 'email')),
          status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'matched', 'in_progress', 'completed', 'canceled')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS request_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // ── Generate display ID ─────────────────────────────────────
      const displayId = generateRequestId();

      // ── Insert service request ──────────────────────────────────
      const result = db.insert(serviceRequests).values({
        customer_id: req.user.userId,
        category_id: data.category_id,
        city: data.city,
        zip_code: data.zip_code || null,
        description: data.description,
        budget_min: data.budget_min ?? null,
        budget_max: data.budget_max ?? null,
        preferred_date: data.preferred_date || null,
        contact_preference: data.contact_preference,
        status: 'new',
      }).returning().get();

      // ── Insert request images ───────────────────────────────────
      const files = req.files as Express.Multer.File[] | undefined;
      const savedImages: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const imageUrl = `/uploads/${file.filename}`;
          db.insert(requestImages).values({
            request_id: result.id,
            image_url: imageUrl,
          }).run();
          savedImages.push(imageUrl);
        }
      }

      // ── Send notifications ──────────────────────────────────────
      // Notify admin about the new request
      notifyAdmin(
        'new_request',
        `New Service Request — ${category.name} in ${data.city}`,
        `A new ${category.name} request (#${displayId}) was submitted by a customer in ${data.city}.`,
        { request_id: result.id, category_id: data.category_id, city: data.city }
      );

      // Notify the customer that their request was received
      notifyUser(
        req.user!.userId,
        'request_received',
        `Request Received — ${category.name} (#${displayId})`,
        `We've received your ${category.name} request (#${displayId}). We'll match you with a local provider soon!`,
        { request_id: result.id }
      );

      // ── Return success ──────────────────────────────────────────
      res.status(201).json({
        success: true,
        request: {
          id: result.id,
          display_id: displayId,
          category_id: result.category_id,
          category_name: category.name,
          city: result.city,
          zip_code: result.zip_code,
          description: result.description,
          budget_min: result.budget_min,
          budget_max: result.budget_max,
          preferred_date: result.preferred_date,
          contact_preference: result.contact_preference,
          status: result.status,
          images: savedImages,
          created_at: result.created_at,
        },
        message: 'Your service request has been submitted successfully!',
      });
    } catch (err: any) {
      console.error('Service request error:', err);
      res.status(500).json({ error: 'Failed to submit request. Please try again.' });
    }
  }
);

export default router;
