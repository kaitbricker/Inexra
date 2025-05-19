import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Server as SocketIOServer } from 'socket.io';
import { MessageAnalysisService } from '@/services/ai/analysis';

const analysisService = MessageAnalysisService.getInstance();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { conversationId, content, platform } = body;

    // Validate input
    if (!conversationId || !content || !platform) {
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

    // Create the message
    const message = await prisma.message.create({
      data: {
        platform,
        senderId: session.user.id,
        recipientId: socialAccount.id,
        content,
        timestamp: new Date(),
        socialAccountId: socialAccount.id,
        conversationId,
      },
      include: {
        socialAccount: true,
      },
    });

    // Analyze the message
    const analysis = await analysisService.analyzeMessage(message);

    // Update message with analysis
    const updatedMessage = await prisma.message.update({
      where: {
        id: message.id,
      },
      data: {
        metadata: {
          analysis,
        },
      },
      include: {
        socialAccount: true,
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // Emit socket event for new message
    const io = (req as any).socket?.server?.io as SocketIOServer;
    if (io) {
      io.to(`conversation:${conversationId}`).emit('new-message', updatedMessage);
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return new NextResponse('Missing conversation ID', { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        socialAccount: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
