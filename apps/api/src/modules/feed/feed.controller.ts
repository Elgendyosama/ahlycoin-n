import { Request, Response } from 'express';
import { FeedService } from './feed.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class FeedController {
  static async getFeed(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const limit = Number(req.query.limit) || 20;
      const cursor = req.query.cursor as string | undefined;

      const feed = await FeedService.getGlobalFeed(userId, limit, cursor);
      res.status(200).json({ success: true, data: feed });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
