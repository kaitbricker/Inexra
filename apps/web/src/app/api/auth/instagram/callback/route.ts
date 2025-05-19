import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getInstagramAccessToken, getInstagramUserProfile } from '@/config/instagram';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return new NextResponse('Missing authorization code', { status: 400 });
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`;
    const tokenData = await getInstagramAccessToken(code, redirectUri);
    const userProfile = await getInstagramUserProfile(tokenData.access_token);

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Update or create social account
    await prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: 'instagram',
        },
      },
      create: {
        userId: session.user.id,
        platform: 'instagram',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        username: userProfile.username,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        username: userProfile.username,
      },
    });

    // Redirect back to settings page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/connections`);
  } catch (error) {
    console.error('Error handling Instagram callback:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
