import { db } from '../../config/database';

export class MatchService {
  static async getMatches(status?: string) {
    const matches = await db.match.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: { startTime: 'desc' },
    });

    return matches;
  }

  static async getMatchById(id: string) {
    const match = await db.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        events: {
          include: { team: true },
          orderBy: { minute: 'asc' },
        },
      },
    });

    if (!match) throw new Error('Match not found');

    return match;
  }
}
