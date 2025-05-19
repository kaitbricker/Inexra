console.log("=== /api/auth/[...nextauth] function loaded ===");

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
          console.log('Authorize called with credentials:', { email: credentials?.email });
          
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials');
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

          console.log('User found:', user ? 'Yes' : 'No');

          if (!user || !user.passwordHash) {
            console.error('Invalid credentials - user not found or no password hash');
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          console.log('Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.error('Invalid credentials - password mismatch');
            throw new Error('Invalid email or password');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error in authorize:', error);
          // Return null to indicate failed login instead of throwing
          return null;
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
      console.log('Redirect called with:', { url, baseUrl });
      // Always redirect to the dashboard after login
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      try {
        console.log('Session callback called with token:', token);
        if (session.user) {
          session.user.id = token.sub as string;
          session.user.role = token.role as string;
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      try {
        console.log('JWT callback called with:', { token, user });
        if (user) {
          token.role = user.role;
        }
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
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
  debug: true, // Enable debug mode in production temporarily
};

let handler;
try {
  handler = NextAuth(enhancedAuthOptions);
} catch (e) {
  console.error('Top-level NextAuth error:', e);
  throw e;
}
export { handler as GET, handler as POST };
