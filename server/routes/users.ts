import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, auditLogs, providerProfiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

// ── Schemas ────────────────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

// ── GET /api/users/profile ────────────────────────────────────────
router.get('/profile', requireAuth, (req: Request, res: Response) => {
  const user = db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    phone: users.phone,
    status: users.status,
    created_at: users.created_at,
  }).from(users).where(eq(users.id, req.user!.userId)).get();

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // If provider, include provider profile
  let providerProfile = null;
  if (user.role === 'provider') {
    providerProfile = db.select().from(providerProfiles).where(eq(providerProfiles.user_id, user.id)).get() || null;
  }

  res.json({ user, providerProfile });
});

// ── PUT /api/users/profile ────────────────────────────────────────
router.put('/profile', requireAuth, validateBody(updateProfileSchema), (req: Request, res: Response) => {
  const { name, phone } = req.body;
  const updates: any = {};

  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  db.update(users).set(updates).where(eq(users.id, req.user!.userId)).run();

  const updated = db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    phone: users.phone,
    status: users.status,
  }).from(users).where(eq(users.id, req.user!.userId)).get();

  res.json({ user: updated });
});

// ── DELETE /api/users/account ─────────────────────────────────────
router.delete('/account', requireAuth, (req: Request, res: Response) => {
  db.update(users)
    .set({ status: 'deleted' })
    .where(eq(users.id, req.user!.userId))
    .run();

  db.insert(auditLogs).values({
    user_id: req.user!.userId,
    action: 'account_deleted',
  }).run();

  res.clearCookie('token');
  res.json({ message: 'Account deleted successfully' });
});

export default router;
