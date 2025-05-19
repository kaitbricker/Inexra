import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { email, push, inApp } = body;

    // Validate input
    if (typeof email !== 'boolean' || typeof push !== 'boolean' || typeof inApp !== 'boolean') {
      return new NextResponse('Invalid notification preferences', { status: 400 });
    }

    // Update user notification preferences
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        notificationPreferences: {
          email,
          push,
          inApp,
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
