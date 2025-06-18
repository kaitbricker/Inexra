import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all platform connections for the user
    const connections = await prisma.platformConnection.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // Format the response
    const status = {
      instagram: connections.find((c: any) => c.platform === 'Instagram') || null,
      linkedin: connections.find((c: any) => c.platform === 'LinkedIn') || null,
      tiktok: connections.find((c: any) => c.platform === 'TikTok') || null,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching platform status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 