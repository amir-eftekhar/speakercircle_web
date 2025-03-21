import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db, findUserByEmail } from '@/lib/db';
import { compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { isTursoConfigured } from './turso-client';

// Define the Role enum if it's not exported from Prisma
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR'
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          console.log("Looking up user:", credentials.email);
          
          // Check if we're in production and using Turso
          const isProd = process.env.NODE_ENV === 'production';
          const useTurso = isProd && isTursoConfigured();
          
          let user;
          if (useTurso) {
            // In production with Turso, use the Turso client
            user = await findUserByEmail(credentials.email);
          } else {
            // Otherwise, use Prisma
            user = await db.user.findUnique({
              where: {
                email: credentials.email,
              },
            });
          }

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          console.log("Found user:", user.email, "with role:", user.role);
          console.log("Stored password hash:", user.password);
          
          // Ensure user.password is a string before comparing
          if (typeof user.password !== 'string') {
            console.log("Invalid password format");
            return null;
          }
          
          const passwordValid = await compare(credentials.password, user.password);
          console.log("Password comparison result:", passwordValid);

          if (!passwordValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("Login successful, returning user");
          return {
            id: user.id as string,
            email: user.email as string,
            name: user.name as string,
            role: user.role as Role,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};
