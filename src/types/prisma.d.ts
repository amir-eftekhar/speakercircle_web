import { PrismaClient } from '@prisma/client';

// Extend the PrismaClient to include the SocialMedia model
declare global {
  namespace PrismaClient {
    interface PrismaClient {
      socialMedia: {
        findMany: (args?: any) => Promise<any[]>;
        findUnique: (args: any) => Promise<any | null>;
        create: (args: any) => Promise<any>;
        update: (args: any) => Promise<any>;
        delete: (args: any) => Promise<any>;
      };
    }
  }
}
