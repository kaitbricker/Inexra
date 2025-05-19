import NextAuth from 'next-auth';
import type { User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import { identifyUser } from '@/utils/logrocket';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

console.log("NextAuth API route loaded");

export const dynamic = 'force-dynamic';

const enhancedAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              passwordHash: true,
            },
          });

          if (!user || !user.passwordHash) {
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user }: { user: User }) {
      try {
        console.log('signIn callback called with user:', user);
        if (user) {
          identifyUser({
            id: user.id,
            email: user.email || '',
            name: user.name || '',
          });
        }
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(enhancedAuthOptions);
export { handler as GET, handler as POST };
