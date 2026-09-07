import { Request, Response } from 'express';
import { SportApi7Service } from './sportapi7.service';

export class MatchController {
  static async getAll(req: Request, res: Response) {
    try {
      const matches = await SportApi7Service.getMatches();
      res.status(200).json(matches);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const matches = await SportApi7Service.getMatches();
      const match = matches.find((m) => String(m.id) === String(req.params.id)) || matches[0];
      res.status(200).json(match);
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }
}
