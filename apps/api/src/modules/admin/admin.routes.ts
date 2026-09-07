import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/admin.middleware';

const router = Router();

// Public/User endpoint to report a post
router.post('/reports/submit', authenticateToken, AdminController.createReport);

// All subsequent routes require Admin privileges
router.use(authenticateToken, requireAdmin);

// Dashboard Overview Stats
router.get('/stats', AdminController.getStats);

// Teams list for match creation
router.get('/teams', AdminController.getTeams);

// Match Management & Control
router.get('/matches', AdminController.getMatches);
router.post('/matches', AdminController.createMatch);
router.patch('/matches/:id/status', AdminController.updateMatchStatus);
router.post('/matches/:id/events', AdminController.addMatchEvent);

// Users Management & Moderation
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/ban', AdminController.toggleBan);
router.patch('/users/:id/verify', AdminController.toggleVerify);
router.patch('/users/:id/role', AdminController.toggleRole);

// Moderation
router.get('/reports', AdminController.getReports);
router.delete('/posts/:id', AdminController.deletePost);

export default router;
