'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function disconnectInstagram() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: session.user.id,
        platform: 'instagram',
      },
    });

    if (socialAccount) {
      await prisma.socialAccount.delete({
        where: {
          id: socialAccount.id,
        },
      });
    }

    revalidatePath('/settings/connections');
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Instagram:', error);
    return { success: false, error: 'Failed to disconnect Instagram' };
  }
}

export async function getInstagramConnection() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: session.user.id,
        platform: 'instagram',
      },
      select: {
        id: true,
        platform: true,
        username: true,
      },
    });

    return {
      isConnected: !!socialAccount,
      username: socialAccount?.username || undefined,
    };
  } catch (error) {
    console.error('Error getting Instagram connection:', error);
    return { isConnected: false, username: undefined };
  }
}
