import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { config } from '../../config/env';

export class AuthService {
  static async register(data: {
    username: string;
    email: string;
    password: string;
    name: string;
    favoriteTeamId?: string;
  }) {
    const existing = await db.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existing) {
      throw new Error('User with this email or username already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await db.user.create({
      data: {
        username: data.username.toLowerCase(),
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
        favoriteTeamId: data.favoriteTeamId || null,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.username}`,
      },
      include: {
        favoriteTeam: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return { user, token };
  }

  static async login(data: { emailOrUsername: string; password: string }) {
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: data.emailOrUsername.toLowerCase() },
          { username: data.emailOrUsername.toLowerCase() },
        ],
      },
      include: {
        favoriteTeam: true,
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return { user, token };
  }

  static async getMe(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        favoriteTeam: true,
        _count: {
          select: { followers: true, following: true, posts: true },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
