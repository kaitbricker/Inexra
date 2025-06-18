import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { INSTAGRAM_CONFIG, INSTAGRAM_ENDPOINTS, getInstagramUserInfo } from '@/lib/instagram';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return new NextResponse('No code provided', { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();

    // Get Instagram user info
    const userInfo = await getInstagramUserInfo(tokenData.access_token);

    // Check if connection exists
    const existingConnection = await prisma.platformConnection.findFirst({
      where: {
        userId: session.user.id,
        platform: 'Instagram',
      },
    });

    if (existingConnection) {
      // Update existing connection
      await prisma.platformConnection.update({
        where: {
          id: existingConnection.id,
        },
        data: {
          accessToken: tokenData.access_token,
          platformUserId: userInfo.id,
          accountName: userInfo.username,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new connection
      await prisma.platformConnection.create({
        data: {
          userId: session.user.id,
          platform: 'Instagram',
          platformUserId: userInfo.id,
          accountName: userInfo.username,
          accessToken: tokenData.access_token,
        },
      });
    }

    // Redirect back to settings
    return NextResponse.redirect(new URL('/settings', process.env.NEXTAUTH_URL!));
  } catch (error) {
    console.error('Instagram callback error:', error);
    return new NextResponse('Authentication failed', { status: 500 });
  }
} 