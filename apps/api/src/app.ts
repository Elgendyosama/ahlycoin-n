import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import postRoutes from './modules/posts/post.routes';
import feedRoutes from './modules/feed/feed.routes';
import matchRoutes from './modules/matches/match.routes';
import adminRoutes from './modules/admin/admin.routes';
import uploadRoutes from './modules/upload/upload.routes';
import { errorHandler } from './middlewares/error.middleware';
import { rateLimiter } from './middlewares/rateLimit.middleware';

const app = express();

// Global Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(rateLimiter(200, 60 * 1000));

// Serve static uploads with proper audio streaming & CORS headers
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');
    if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'audio/webm');
    } else if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    } else if (filePath.endsWith('.mp4') || filePath.endsWith('.m4a')) {
      res.setHeader('Content-Type', 'audio/mp4');
    } else if (filePath.endsWith('.ogg')) {
      res.setHeader('Content-Type', 'audio/ogg');
    }
  },
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;

