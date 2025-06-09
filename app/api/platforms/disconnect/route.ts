import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const user = session?.user as SessionUser | undefined;
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform } = await request.json();
    
    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    // Delete the platform connection
    await prisma.platformConnection.deleteMany({
      where: {
        userId: user.id,
        platform,
      },
    });

    // Delete associated messages
    await prisma.message.deleteMany({
      where: {
        userId: user.id,
        platform,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Platform disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect platform' },
      { status: 500 }
    );
  }
} 