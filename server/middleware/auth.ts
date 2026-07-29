import { Request, Response, NextFunction } from 'express';
import { verifyToken, getTokenFromCookie, getTokenFromHeader, JwtPayload } from '../utils/jwt';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Require a valid JWT — attaches user to req */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getTokenFromCookie(req) || getTokenFromHeader(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Require admin role */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

/** Require provider role */
export function requireProvider(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || (req.user.role !== 'provider' && req.user.role !== 'admin')) {
    res.status(403).json({ error: 'Provider access required' });
    return;
  }
  next();
}

/** Optional auth — attaches user if token present, but doesn't fail */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getTokenFromCookie(req) || getTokenFromHeader(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch (_) {
      // ignore invalid tokens for optional auth
    }
  }
  next();
}
