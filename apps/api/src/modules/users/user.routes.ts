import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', UserController.getUsers);
router.get('/following', UserController.getFollowing);
router.get('/:username', UserController.getProfile);
router.post('/:username/follow', authenticateToken, UserController.follow);
router.delete('/:username/unfollow', authenticateToken, UserController.unfollow);

export default router;
