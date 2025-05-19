import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        messages: {
          include: {
            socialAccount: true,
          },
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    // Check if user has access to this conversation
    const hasAccess = conversation.messages.some(
      message => message.socialAccount.userId === session.user.id
    );

    if (!hasAccess) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Check if user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        messages: {
          include: {
            socialAccount: true,
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    const hasAccess = conversation.messages.some(
      message => message.socialAccount.userId === session.user.id
    );

    if (!hasAccess) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update conversation status
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        messages: {
          include: {
            socialAccount: true,
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    const hasAccess = conversation.messages.some(
      message => message.socialAccount.userId === session.user.id
    );

    if (!hasAccess) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete conversation and all its messages
    await prisma.conversation.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
