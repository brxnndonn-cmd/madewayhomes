import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../services/notifications';

const router = Router();

// All notification routes require auth
router.use(requireAuth);

// ── GET /api/notifications ──────────────────────────────────────────
// Returns current user's notifications
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const notifications = await getNotifications(userId, limit);

    res.json({ notifications });
  } catch (err: any) {
    console.error('GET /api/notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ── GET /api/notifications/unread-count ─────────────────────────────
router.get('/unread-count', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const count = await getUnreadCount(userId);

    res.json({ count });
  } catch (err: any) {
    console.error('GET /api/notifications/unread-count error:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// ── PUT /api/notifications/:id/read ─────────────────────────────────
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id, 10);
    if (isNaN(notificationId)) {
      res.status(400).json({ error: 'Invalid notification ID' });
      return;
    }

    await markAsRead(notificationId);

    res.json({ success: true });
  } catch (err: any) {
    console.error('PUT /api/notifications/:id/read error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ── PUT /api/notifications/read-all ─────────────────────────────────
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    await markAllAsRead(userId);

    res.json({ success: true });
  } catch (err: any) {
    console.error('PUT /api/notifications/read-all error:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;
