import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { INSTAGRAM_CONFIG, INSTAGRAM_ENDPOINTS, getInstagramUserInfo, getInstagramMessages, transformInstagramMessages } from '@/lib/instagram';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const user = session?.user as SessionUser | undefined;
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(INSTAGRAM_ENDPOINTS.accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CONFIG.clientId!,
        client_secret: INSTAGRAM_CONFIG.clientSecret!,
        grant_type: 'authorization_code',
        redirect_uri: INSTAGRAM_CONFIG.redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for access token');
    }

    const { access_token, user_id } = await tokenResponse.json();

    // Get user info
    const userInfo = await getInstagramUserInfo(access_token);

    // Store the connection in the database
    await prisma.platformConnection.create({
      data: {
        userId: user.id,
        platform: 'Instagram',
        platformUserId: user_id,
        accessToken: access_token,
        accountName: userInfo.username,
        metadata: {
          accountType: userInfo.account_type,
        },
      },
    });

    // Fetch and store initial messages
    const messages = await getInstagramMessages(access_token, user_id);
    const transformedMessages = transformInstagramMessages(messages.data);

    // Store messages in batches
    const batchSize = 100;
    for (let i = 0; i < transformedMessages.length; i += batchSize) {
      const batch = transformedMessages.slice(i, i + batchSize);
      await prisma.message.createMany({
        data: batch.map(msg => ({
          ...msg,
          userId: user.id,
        })),
      });
    }

    // Redirect back to settings page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=social-integrations`);
  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Failed to complete Instagram connection' },
      { status: 500 }
    );
  }
} 