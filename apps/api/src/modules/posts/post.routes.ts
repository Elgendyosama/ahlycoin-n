import { Router } from 'express';
import { PostController } from './post.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, PostController.create);
router.get('/:id', PostController.getById);
router.post('/:id/like', authenticateToken, PostController.toggleLike);
router.post('/:id/comments', authenticateToken, PostController.addComment);

export default router;
