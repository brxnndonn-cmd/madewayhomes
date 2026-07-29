import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../db';
import { users, auditLogs } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { signToken } from '../utils/jwt';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

// ── Schemas ────────────────────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['customer', 'provider']).default('customer'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ── POST /api/auth/register ────────────────────────────────────────
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, phone } = req.body;

    // Check for existing user
    const existing = db.select().from(users).where(eq(users.email, email)).get();
    if (existing) {
      res.status(409).json({ error: 'A user with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db.insert(users).values({
      email,
      password_hash: passwordHash,
      name,
      role,
      phone: phone || null,
      status: 'active',
    }).returning().get();

    // Log audit
    db.insert(auditLogs).values({
      user_id: result.id,
      action: 'user_registered',
      details: JSON.stringify({ email, role }),
    }).run();

    // Create token
    const token = signToken({ userId: result.id, email: result.email, role: result.role });

    // Set cookie and return
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        status: result.status,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.status === 'deleted') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    db.insert(auditLogs).values({
      user_id: user.id,
      action: 'user_login',
      details: JSON.stringify({ email }),
    }).run();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/logout ──────────────────────────────────────────
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', requireAuth, (req: Request, res: Response) => {
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

  // Return a fresh token so the client can refresh after page reload
  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.json({ user, token });
});

// ── POST /api/auth/forgot-password ─────────────────────────────────
router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      // Don't reveal whether the email exists
      res.json({ message: 'If an account exists with that email, a reset token has been generated.' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    db.update(users)
      .set({ reset_token: resetToken, reset_token_expires: resetExpires })
      .where(eq(users.id, user.id))
      .run();

    db.insert(auditLogs).values({
      user_id: user.id,
      action: 'password_reset_requested',
      details: JSON.stringify({ email }),
    }).run();

    // Only return the reset token in development mode
    if (process.env.NODE_ENV !== 'production') {
      res.json({
        message: 'Password reset token generated.',
        resetToken,
      });
    } else {
      res.json({
        message: 'If an account exists with that email, a reset token has been generated.',
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/reset-password ──────────────────────────────────
router.post('/reset-password', validateBody(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const user = db.select().from(users).where(
      and(
        eq(users.reset_token, token),
      )
    ).get();

    if (!user || !user.reset_token_expires) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Check expiry
    if (new Date(user.reset_token_expires) < new Date()) {
      res.status(400).json({ error: 'Reset token has expired' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    db.update(users)
      .set({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
      })
      .where(eq(users.id, user.id))
      .run();

    db.insert(auditLogs).values({
      user_id: user.id,
      action: 'password_reset_completed',
      details: JSON.stringify({}),
    }).run();

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
