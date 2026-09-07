import { db } from '../../config/database';

export class FeedService {
  static async getGlobalFeed(userId?: string, limit = 20, cursor?: string) {
    const posts = await db.post.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          include: { favoriteTeam: true },
        },
        match: {
          include: { homeTeam: true, awayTeam: true },
        },
        likes: userId ? { where: { userId } } : false,
        _count: { select: { likes: true, comments: true } },
      },
    });

    let nextCursor: string | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem?.id;
    }

    const formattedPosts = posts.map((post) => ({
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLikedByMe: post.likes ? post.likes.length > 0 : false,
    }));

    return { posts: formattedPosts, nextCursor };
  }
}
