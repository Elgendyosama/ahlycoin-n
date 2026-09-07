import dotenv from 'dotenv';
import path from 'path';

// Load .env from root if available
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-enterprise-sports-social-jwt-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_3Fmy6nvUdjiV@ep-blue-rice-a5ldv46p-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};
