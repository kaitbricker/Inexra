import NextAuth from 'next-auth';
import type { User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import { identifyUser } from '@/utils/logrocket';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

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
          console.log('Authorize called with:', credentials);
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing email or password');
            throw new Error('Invalid credentials');
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

          console.log('User found:', user);

          if (!user || !user.passwordHash) {
            console.error('User not found or missing passwordHash');
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          console.log('Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.error('Password is not valid');
            throw new Error('Invalid credentials');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Error in authorize:', error);
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
        console.error('Error in signIn callback:', error);
        return false;
      }
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
};

const handler = NextAuth(enhancedAuthOptions);
export { handler as GET, handler as POST };
