import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import publicRoutes from './routes/public';
import requestRoutes from './routes/requests';
import providerRoutes from './routes/providers';
import notificationRoutes from './routes/notifications';
import { runMigrations } from './db/migrate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);
const isProduction = process.env.NODE_ENV === 'production';

// ── Rate Limiters ──────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const formLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// ── Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: isProduction ? false : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ── API Routes ─────────────────────────────────────────────────────
// Auth routes: 5 req/min per IP
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);
// Public form routes: 10 req/min per IP
app.use('/api', formLimiter, publicRoutes);
app.use('/api/service-requests', formLimiter, requestRoutes);
app.use('/api/providers', formLimiter, providerRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve uploaded public files (credentials stored outside this tree)
const uploadsPublicPath = path.resolve(__dirname, '../data/uploads/public');
if (!fs.existsSync(uploadsPublicPath)) {
  fs.mkdirSync(uploadsPublicPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPublicPath));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve Static Frontend in Production ────────────────────────────
if (isProduction) {
  const distPath = path.resolve(__dirname, '../client/dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // SPA fallback: serve index.html for all non-API routes
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.warn('Production mode but client/dist not found. Run `bun run build` first.');
  }
}

// ── Global Error Handler ───────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal server error' : (err.message || 'Internal server error'),
  });
});

// ── Start Server ───────────────────────────────────────────────────
runMigrations();
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MadeWayHomes server running on http://0.0.0.0:${PORT}`);
  console.log(`   Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`   API: http://0.0.0.0:${PORT}/api`);
});

export { server };
export default app;
