import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { instagramConfig } from '@/config/instagram';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if Instagram integration is configured
    if (!instagramConfig.appId || !instagramConfig.appSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?error=instagram_not_configured`
      );
    }

    const searchParams = new URL(req.url).searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return new NextResponse('Missing code parameter', { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: instagramConfig.appId,
        client_secret: instagramConfig.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: instagramConfig.redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Error exchanging code for token:', await tokenResponse.text());
      return new NextResponse('Failed to exchange code for token', { status: 500 });
    }

    const { access_token, user_id } = await tokenResponse.json();

    // Get long-lived access token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${instagramConfig.appSecret}&access_token=${access_token}`
    );

    if (!longLivedTokenResponse.ok) {
      console.error('Error getting long-lived token:', await longLivedTokenResponse.text());
      return new NextResponse('Failed to get long-lived token', { status: 500 });
    }

    const { access_token: longLivedToken } = await longLivedTokenResponse.json();

    // Get user profile
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${longLivedToken}`
    );

    if (!profileResponse.ok) {
      console.error('Error getting user profile:', await profileResponse.text());
      return new NextResponse('Failed to get user profile', { status: 500 });
    }

    const profile = await profileResponse.json();

    // Calculate token expiration (60 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    // Save or update social account
    await prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: 'instagram',
        },
      },
      create: {
        platform: 'instagram',
        accessToken: longLivedToken,
        refreshToken: longLivedToken, // Instagram doesn't provide refresh tokens
        expiresAt,
        userId: session.user.id,
      },
      update: {
        accessToken: longLivedToken,
        refreshToken: longLivedToken,
        expiresAt,
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?success=true`
    );
  } catch (error) {
    console.error('Error in Instagram auth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?error=true`
    );
  }
}
