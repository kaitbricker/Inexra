import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // Get user's referrals
    const referrals = await prisma.referral.findMany({
      where: {
        referrerId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Calculate stats
    const stats = {
      totalReferrals: await prisma.referral.count({
        where: { referrerId: session.user.id },
      }),
      activeReferrals: await prisma.referral.count({
        where: {
          referrerId: session.user.id,
          status: 'active',
        },
      }),
      pendingRewards: await prisma.referral.aggregate({
        where: {
          referrerId: session.user.id,
          status: 'pending',
        },
        _sum: {
          reward: true,
        },
      }),
      earnedRewards: await prisma.referral.aggregate({
        where: {
          referrerId: session.user.id,
          status: 'completed',
        },
        _sum: {
          reward: true,
        },
      }),
    };

    return res.status(200).json({
      referrals,
      stats: {
        totalReferrals: stats.totalReferrals,
        activeReferrals: stats.activeReferrals,
        pendingRewards: stats.pendingRewards._sum.reward || 0,
        earnedRewards: stats.earnedRewards._sum.reward || 0,
      },
    });
  } catch (error) {
    console.error('Error handling referral request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
