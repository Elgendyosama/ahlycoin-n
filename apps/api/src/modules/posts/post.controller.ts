import { Request, Response } from 'express';
import { PostService } from './post.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class PostController {
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const post = await PostService.createPost(req.user!.id, req.body);
      res.status(201).json({ success: true, data: post });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const post = await PostService.getPostById(req.params.id, userId);
      res.status(200).json({ success: true, data: post });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async toggleLike(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await PostService.toggleLike(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async addComment(req: AuthenticatedRequest, res: Response) {
    try {
      const comment = await PostService.addComment(
        req.user!.id,
        req.params.id,
        req.body.content
      );
      res.status(201).json({ success: true, data: comment });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
