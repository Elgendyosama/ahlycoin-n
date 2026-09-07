import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.id);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }
}
