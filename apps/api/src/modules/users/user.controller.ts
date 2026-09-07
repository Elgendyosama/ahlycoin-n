import { Request, Response } from 'express';
import { UserService } from './user.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class UserController {
  static async getFollowing(req: Request, res: Response) {
    try {
      const currentUserId = (req.query.currentUserId as string) || (req.headers['x-user-id'] as string) || (req as AuthenticatedRequest).user?.id;
      const users = await UserService.getFollowing(currentUserId);
      res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const currentUserId = (req.query.currentUserId as string) || (req.headers['x-user-id'] as string) || (req as AuthenticatedRequest).user?.id;
      const users = await UserService.getUsers(currentUserId);
      res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const currentUserId = (req as AuthenticatedRequest).user?.id;
      const profile = await UserService.getProfile(req.params.username, currentUserId);
      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async follow(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await UserService.followUser(req.user!.id, req.params.username);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async unfollow(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await UserService.unfollowUser(req.user!.id, req.params.username);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
