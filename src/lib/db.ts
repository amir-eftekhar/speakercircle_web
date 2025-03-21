import { PrismaClient } from '@prisma/client';
import { isTursoConfigured } from './turso-client';
import { findUserByEmail } from './db-middleware';

declare global {
  var cachedPrisma: PrismaClient;
}

// Initialize PrismaClient with appropriate settings
let db: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, check if Turso is configured
  const useTurso = isTursoConfigured();
  
  if (useTurso) {
    console.log('Using Turso for database in production');
    // In production with Turso, we'll use a special configuration
    // that doesn't try to write to the filesystem
    db = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./placeholder.db', // This won't be used, but Prisma requires it
        },
      },
      log: ['error'],
    });
  } else {
    // In production without Turso, use the standard Prisma client
    db = new PrismaClient();
  }
} else {
  // In development, use cached Prisma client
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  db = global.cachedPrisma;
}

export { db, findUserByEmail }; 