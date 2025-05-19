import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        messages: {
          some: {
            socialAccount: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            timestamp: 'desc',
          },
          include: {
            socialAccount: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { platform, recipientId } = body;

    if (!platform || !recipientId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get the user's social account for the platform
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: session.user.id,
        platform,
      },
    });

    if (!socialAccount) {
      return new NextResponse('Social account not found', { status: 404 });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        platform,
        status: 'active',
        messages: {
          create: {
            platform,
            senderId: session.user.id,
            recipientId,
            content: 'Conversation started',
            timestamp: new Date(),
            socialAccountId: socialAccount.id,
          },
        },
      },
      include: {
        messages: {
          include: {
            socialAccount: true,
          },
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
