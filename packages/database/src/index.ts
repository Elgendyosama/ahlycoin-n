import { PrismaClient } from '@prisma/client';

declare global {
  var globalPrisma: PrismaClient | undefined;
}

export const db: PrismaClient = globalThis.globalPrisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalPrisma = db;
}

export * from '@prisma/client';
