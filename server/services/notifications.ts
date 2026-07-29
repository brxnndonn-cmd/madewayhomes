import { db, sqlite } from '../db';
import { notifications } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

// ── Types ──────────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  metadata: string | null;
  created_at: string;
}

// ── Ensure table exists ────────────────────────────────────────────────

function ensureTable() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// ── Core: notifyUser ───────────────────────────────────────────────────

export async function notifyUser(
  userId: number,
  type: string,
  title: string,
  message: string,
  metadata?: object
): Promise<void> {
  ensureTable();

  // 1. Create notification record in DB
  try {
    db.insert(notifications).values({
      user_id: userId,
      type,
      title,
      message,
      is_read: false,
      metadata: metadata ? JSON.stringify(metadata) : null,
    }).run();
  } catch (err) {
    console.error(`[NOTIFICATION] Failed to create DB record for user ${userId}:`, err);
  }

  // 2. Log to console
  console.log(`[NOTIFICATION] ${type}: ${title} — ${message}`);

  // 3. If EMAIL_API_KEY env var is set, send real email (stub for now)
  if (process.env.EMAIL_API_KEY) {
    console.log(`[EMAIL] Sending real email to user ${userId}: "${title}"`);
    // TODO: Integrate with Resend, SendGrid, etc.
    // await sendEmail(userId, type, title, message);
  } else {
    // 4. Log stub
    console.log(`[EMAIL STUB] Would send to user ${userId}: ${title}`);
  }
}

// ── Notify admin helpers ───────────────────────────────────────────────

export async function notifyAdmin(
  type: string,
  title: string,
  message: string,
  metadata?: object
): Promise<void> {
  // Find all admin users
  const adminUsers = sqlite.prepare(
    "SELECT id FROM users WHERE role = 'admin' AND status = 'active'"
  ).all() as { id: number }[];

  for (const admin of adminUsers) {
    await notifyUser(admin.id, type, title, message, metadata);
  }
}

// ── Query helpers ──────────────────────────────────────────────────────

export async function getUnreadCount(userId: number): Promise<number> {
  ensureTable();
  const result = db.select()
    .from(notifications)
    .where(and(eq(notifications.user_id, userId), eq(notifications.is_read, false)))
    .all();
  return result.length;
}

export async function getNotifications(
  userId: number,
  limit: number = 50
): Promise<Notification[]> {
  ensureTable();
  return db.select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at))
    .limit(limit)
    .all() as Notification[];
}

export async function markAsRead(notificationId: number): Promise<void> {
  ensureTable();
  db.update(notifications)
    .set({ is_read: true })
    .where(eq(notifications.id, notificationId))
    .run();
}

export async function markAllAsRead(userId: number): Promise<void> {
  ensureTable();
  db.update(notifications)
    .set({ is_read: true })
    .where(and(eq(notifications.user_id, userId), eq(notifications.is_read, false)))
    .run();
}

// ── Admin: get all notifications system-wide ───────────────────────────

export async function getAllNotifications(limit: number = 20): Promise<(Notification & { user_name?: string; user_email?: string })[]> {
  ensureTable();
  const rows = db.select()
    .from(notifications)
    .orderBy(desc(notifications.created_at))
    .limit(limit)
    .all() as Notification[];

  // Enrich with user info
  return rows.map((n) => {
    const user = sqlite.prepare(
      'SELECT name, email FROM users WHERE id = ?'
    ).get(n.user_id) as { name: string; email: string } | undefined;

    return {
      ...n,
      user_name: user?.name || 'Unknown',
      user_email: user?.email || '',
    };
  });
}
