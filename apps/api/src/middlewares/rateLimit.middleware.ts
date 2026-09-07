import { Request, Response, NextFunction } from 'express';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (maxRequests = 100, windowMs = 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'global';
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.',
      });
    }

    record.count++;
    next();
  };
};
