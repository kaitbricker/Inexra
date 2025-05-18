import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Rate limiting
    await rateLimit(req, res);

    // Get user session
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user retention data
    const retention = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        createdAt: true,
        lastLoginAt: true,
      },
    });

    // Process retention data
    const retentionData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const usersOnDay = retention.filter(
        user => user.createdAt.toISOString().split('T')[0] <= dateStr
      );
      
      const activeUsers = usersOnDay.filter(
        user => user.lastLoginAt && user.lastLoginAt.toISOString().split('T')[0] >= dateStr
      );

      return {
        date: dateStr,
        rate: usersOnDay.length > 0
          ? Math.round((activeUsers.length / usersOnDay.length) * 100)
          : 0,
      };
    }).reverse();

    // Get referral data
    const referrals = await prisma.referral.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Process referral data
    const referralData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayReferrals = referrals.filter(
        ref => ref.createdAt.toISOString().split('T')[0] === dateStr
      );

      return {
        date: dateStr,
        count: dayReferrals.length,
        conversions: dayReferrals.filter(ref => ref.status === 'completed').length,
      };
    }).reverse();

    // Get user segments
    const segments = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    const segmentData = segments.map(segment => ({
      name: segment.role,
      value: segment._count,
    }));

    return res.status(200).json({
      retention: retentionData,
      referrals: referralData,
      segments: segmentData,
    });
  } catch (error) {
    console.error('Error handling analytics request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 