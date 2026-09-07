import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { db } from '../config/database';
import { Role } from '@prisma/client';

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }

    // Query user role from database to ensure fresh permission status
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, isBanned: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, error: 'Your account has been banned from accessing management features.' });
    }

    if (user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
      return res.status(403).json({ success: false, error: 'Access denied. Administrative or Moderator privileges required.' });
    }

    next();
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Authorization check failed' });
  }
};
