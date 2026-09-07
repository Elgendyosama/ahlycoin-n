import { db } from '../../config/database';
import { getIO } from '../../sockets';
import { MatchStatus, MatchEventType, Role } from '@prisma/client';

export class AdminService {
  // Stats Overview
  static async getStats() {
    const totalUsers = await db.user.count();
    const totalPosts = await db.post.count();
    const totalMatches = await db.match.count();
    const liveMatches = await db.match.count({ where: { status: 'LIVE' } });

    let activeConnections = 0;
    try {
      const io = getIO();
      activeConnections = io.engine.clientsCount;
    } catch {
      activeConnections = 0;
    }

    return {
      totalUsers,
      totalPosts,
      totalMatches,
      liveMatches,
      activeConnections,
    };
  }

  // Matches Management
  static async getMatches() {
    return await db.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        events: {
          orderBy: { minute: 'desc' },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  static async createMatch(data: {
    homeTeamId: string;
    awayTeamId: string;
    startTime: string | Date;
    venue: string;
    league: string;
  }) {
    const match = await db.match.create({
      data: {
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        startTime: new Date(data.startTime),
        venue: data.venue,
        league: data.league,
        status: MatchStatus.SCHEDULED,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    try {
      const io = getIO();
      io.emit('match_created', match);
    } catch (e) {
      console.warn('Socket emit failed:', e);
    }

    return match;
  }

  static async updateMatchStatus(matchId: string, status: MatchStatus) {
    const match = await db.match.update({
      where: { id: matchId },
      data: { status },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    try {
      const io = getIO();
      io.to(`match:${matchId}`).emit('match_status_update', match);
      io.emit('match_status_update', match);
    } catch (e) {
      console.warn('Socket emit failed:', e);
    }

    return match;
  }

  static async addMatchEvent(
    matchId: string,
    data: {
      type: MatchEventType;
      minute: number;
      teamId: string;
      player: string;
      assistPlayer?: string;
      description: string;
    }
  ) {
    // Check match
    const match = await db.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error('Match not found');

    // Create event
    const event = await db.matchEvent.create({
      data: {
        matchId,
        type: data.type,
        minute: data.minute,
        teamId: data.teamId,
        player: data.player,
        assistPlayer: data.assistPlayer || null,
        description: data.description,
      },
      include: { team: true },
    });

    // Update match score if GOAL
    let updatedMatch = match;
    if (data.type === MatchEventType.GOAL) {
      const isHome = match.homeTeamId === data.teamId;
      updatedMatch = await db.match.update({
        where: { id: matchId },
        data: {
          homeScore: isHome ? { increment: 1 } : undefined,
          awayScore: !isHome ? { increment: 1 } : undefined,
          minute: data.minute,
        },
        include: { homeTeam: true, awayTeam: true },
      });
    }

    // Emit real-time socket event
    try {
      const io = getIO();
      const payload = { event, match: updatedMatch };
      io.to(`match:${matchId}`).emit('match_event_update', payload);
      io.emit('match_event_update', payload);
    } catch (e) {
      console.warn('Socket emit failed:', e);
    }

    return { event, match: updatedMatch };
  }

  // Users Management
  static async getUsers(page = 1, limit = 20, search = '') {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          isBanned: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { posts: true, comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async toggleUserBan(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    return await db.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
      select: { id: true, username: true, isBanned: true },
    });
  }

  static async toggleUserVerify(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    return await db.user.update({
      where: { id: userId },
      data: { isVerified: !user.isVerified },
      select: { id: true, username: true, isVerified: true },
    });
  }

  static async toggleUserRole(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const newRole = user.role === Role.ADMIN ? Role.USER : Role.ADMIN;
    return await db.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, username: true, role: true },
    });
  }

  // Moderation
  static async getReportedPosts() {
    return await db.post.findMany({
      include: {
        author: {
          select: { id: true, username: true, name: true, avatarUrl: true },
        },
        reports: {
          include: {
            reporter: {
              select: { id: true, username: true, name: true },
            },
          },
        },
        _count: { select: { reports: true, likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async reportPost(reporterId: string, postId: string, reason: string) {
    return await db.report.create({
      data: {
        reporterId,
        postId,
        reason,
      },
    });
  }

  static async deletePost(postId: string) {
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');

    await db.post.delete({ where: { id: postId } });
    return { success: true, deletedPostId: postId };
  }

  static async getTeams() {
    return await db.team.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
