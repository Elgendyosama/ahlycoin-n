import { Router } from 'express';
import { FeedController } from './feed.controller';

const router = Router();

router.get('/', FeedController.getFeed);

export default router;
