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

    // Get top users by points
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
      },
      orderBy: {
        points: 'desc',
      },
      take: 10,
    });

    // Calculate ranks and format response
    const leaderboard = topUsers.map((user, index) => ({
      id: user.id,
      name: user.name,
      points: user.points,
      rank: index + 1,
      avatar: user.image || '/default-avatar.png',
    }));

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error handling leaderboard request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
