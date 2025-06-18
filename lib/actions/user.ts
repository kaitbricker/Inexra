'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function updateUserSettings(data: { tagStack?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tagStack: data.tagStack,
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Failed to update user settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
} 