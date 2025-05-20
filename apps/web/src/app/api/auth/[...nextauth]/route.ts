import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = async (req: any, res: any) => {
  try {
    console.log('NextAuth handler called with method:', req.method);
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
    
    return await NextAuth(authOptions)(req, res);
  } catch (error) {
    console.error('NextAuth error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export { handler as GET, handler as POST }; 