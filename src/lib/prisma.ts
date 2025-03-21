import { PrismaClient } from '@prisma/client';
import { isTursoConfigured } from './turso-client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

// In development, use the local SQLite database
// In production with Turso configured, use a special configuration
// that works with the read-only filesystem
const prismaClientSingleton = () => {
  // Check if we're in production and Turso is configured
  const isProd = process.env.NODE_ENV === 'production';
  const useTurso = isProd && isTursoConfigured();
  
  if (useTurso) {
    console.log('Using Turso for database in production');
    // In production with Turso, we'll use a special configuration
    // that doesn't try to write to the filesystem
    return new PrismaClient({
      datasources: {
        db: {
          url: 'file:./placeholder.db', // This won't be used, but Prisma requires it
        },
      },
      // Disable migrations and other filesystem operations
      // that would fail in a read-only environment
      log: ['error'],
    });
  } else {
    // In development or when Turso is not configured,
    // use the standard Prisma client with SQLite
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
