import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { platformConfigs } from '@/config/platforms';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if LinkedIn integration is configured
    if (!platformConfigs.linkedin.appId || !platformConfigs.linkedin.appSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?error=linkedin_not_configured`
      );
    }

    const searchParams = new URL(req.url).searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return new NextResponse('Missing code parameter', { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(platformConfigs.linkedin.tokenUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: platformConfigs.linkedin.redirectUri!,
        client_id: platformConfigs.linkedin.appId,
        client_secret: platformConfigs.linkedin.appSecret,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Error exchanging code for token:', await tokenResponse.text());
      return new NextResponse('Failed to exchange code for token', { status: 500 });
    }

    const { access_token, expires_in } = await tokenResponse.json();

    // Get user profile
    const profileResponse = await fetch(`${platformConfigs.linkedin.graphUrl}/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error('Error getting user profile:', await profileResponse.text());
      return new NextResponse('Failed to get user profile', { status: 500 });
    }

    const profile = await profileResponse.json();

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    // Save or update social account
    await prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: 'linkedin',
        },
      },
      create: {
        platform: 'linkedin',
        accessToken: access_token,
        refreshToken: access_token, // LinkedIn doesn't provide refresh tokens
        expiresAt,
        userId: session.user.id,
        metadata: {
          id: profile.id,
          name: profile.localizedFirstName + ' ' + profile.localizedLastName,
        },
      },
      update: {
        accessToken: access_token,
        refreshToken: access_token,
        expiresAt,
        metadata: {
          id: profile.id,
          name: profile.localizedFirstName + ' ' + profile.localizedLastName,
        },
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?success=true`
    );
  } catch (error) {
    console.error('Error in LinkedIn auth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections?error=true`
    );
  }
} 