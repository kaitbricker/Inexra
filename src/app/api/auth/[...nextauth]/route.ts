import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const dynamic = 'force-dynamic';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Minimal: Accept any non-empty credentials for testing
        if (credentials?.email && credentials?.password) {
          return { id: '1', email: credentials.email };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 