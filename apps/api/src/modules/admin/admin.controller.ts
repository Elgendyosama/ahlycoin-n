import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { MatchStatus } from '@prisma/client';

export class AdminController {
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getMatches(req: Request, res: Response) {
    try {
      const matches = await AdminService.getMatches();
      res.status(200).json({ success: true, data: matches });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createMatch(req: AuthenticatedRequest, res: Response) {
    try {
      const { homeTeamId, awayTeamId, startTime, venue, league } = req.body;
      if (!homeTeamId || !awayTeamId || !startTime || !venue || !league) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
      }

      const match = await AdminService.createMatch({
        homeTeamId,
        awayTeamId,
        startTime,
        venue,
        league,
      });

      res.status(201).json({ success: true, data: match });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateMatchStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!Object.values(MatchStatus).includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid match status' });
      }

      const match = await AdminService.updateMatchStatus(id, status);
      res.status(200).json({ success: true, data: match });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async addMatchEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { type, minute, teamId, player, assistPlayer, description } = req.body;

      if (!type || minute === undefined || !teamId || !player) {
        return res.status(400).json({ success: false, error: 'Type, minute, teamId, and player are required' });
      }

      const result = await AdminService.addMatchEvent(id, {
        type,
        minute: Number(minute),
        teamId,
        player,
        assistPlayer,
        description: description || `${type} by ${player}`,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || '';

      const result = await AdminService.getUsers(page, limit, search);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async toggleBan(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await AdminService.toggleUserBan(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async toggleVerify(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await AdminService.toggleUserVerify(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async toggleRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await AdminService.toggleUserRole(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getReports(req: Request, res: Response) {
    try {
      const reports = await AdminService.getReportedPosts();
      res.status(200).json({ success: true, data: reports });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { postId, reason } = req.body;
      if (!postId || !reason) {
        return res.status(400).json({ success: false, error: 'Post ID and reason are required' });
      }
      const report = await AdminService.reportPost(req.user!.id, postId, reason);
      res.status(201).json({ success: true, data: report });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deletePost(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await AdminService.deletePost(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getTeams(req: Request, res: Response) {
    try {
      const teams = await AdminService.getTeams();
      res.status(200).json({ success: true, data: teams });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
