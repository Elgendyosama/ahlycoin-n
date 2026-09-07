import { db } from '../../config/database';

export class PostService {
  static async createPost(
    authorId: string,
    data: { content: string; mediaUrls?: string[]; matchId?: string }
  ) {
    let matchId: string | null = null;
    if (data.matchId && data.matchId.trim() !== '') {
      const matchExists = await db.match.findUnique({ where: { id: data.matchId } });
      if (matchExists) {
        matchId = data.matchId;
      }
    }

    const post = await db.post.create({
      data: {
        authorId,
        content: data.content,
        mediaUrls: data.mediaUrls || [],
        matchId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            favoriteTeam: true,
          },
        },
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return {
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLikedByMe: false,
    };
  }

  static async getPostById(postId: string, userId?: string) {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          include: { favoriteTeam: true },
        },
        match: {
          include: { homeTeam: true, awayTeam: true },
        },
        comments: {
          include: {
            user: { select: { id: true, username: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        likes: userId ? { where: { userId } } : false,
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) throw new Error('Post not found');

    return {
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLikedByMe: post.likes ? post.likes.length > 0 : false,
    };
  }

  static async toggleLike(userId: string, postId: string) {
    const existing = await db.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await db.like.delete({ where: { id: existing.id } });
      return { liked: false };
    } else {
      await db.like.create({ data: { userId, postId } });
      return { liked: true };
    }
  }

  static async addComment(userId: string, postId: string, content: string) {
    const comment = await db.comment.create({
      data: { userId, postId, content },
      include: {
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });

    return comment;
  }
}
