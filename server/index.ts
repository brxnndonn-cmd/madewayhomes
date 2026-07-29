import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import publicRoutes from './routes/public';
import requestRoutes from './routes/requests';
import providerRoutes from './routes/providers';
import notificationRoutes from './routes/notifications';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);
const isProduction = process.env.NODE_ENV === 'production';

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: isProduction ? false : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ── API Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use('/api/service-requests', requestRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve uploaded files
const uploadsPath = path.resolve(__dirname, '../data/uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MadeWayHomes server running on http://0.0.0.0:${PORT}`);
  console.log(`   Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`   API: http://0.0.0.0:${PORT}/api`);
});

export default app;
