import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';

const ACHIEVEMENTS = [
  {
    id: 'first_referral',
    title: 'First Referral',
    description: 'Invite your first friend to join',
    icon: '🎯',
    reward: 100,
  },
  {
    id: 'power_user',
    title: 'Power User',
    description: 'Complete 10 tasks in a day',
    icon: '⚡',
    reward: 200,
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Connect with 5 team members',
    icon: '🦋',
    reward: 150,
  },
  {
    id: 'early_adopter',
    title: 'Early Adopter',
    description: 'Join during the beta phase',
    icon: '🚀',
    reward: 300,
  },
  {
    id: 'referral_master',
    title: 'Referral Master',
    description: 'Get 5 successful referrals',
    icon: '👑',
    reward: 500,
  },
  {
    id: 'task_master',
    title: 'Task Master',
    description: 'Complete 50 tasks',
    icon: '✅',
    reward: 250,
  },
];

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

    // Get user's achievements and progress
    const userAchievements = await prisma.achievement.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // Get user's activity data
    const userActivity = await prisma.userActivity.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Calculate achievement progress
    const achievements = ACHIEVEMENTS.map(achievement => {
      const userAchievement = userAchievements.find(
        a => a.achievementId === achievement.id
      );

      let progress = 0;
      let completed = false;

      switch (achievement.id) {
        case 'first_referral':
          progress = userActivity?.referralCount ? 100 : 0;
          completed = userActivity?.referralCount > 0;
          break;
        case 'power_user':
          progress = Math.min((userActivity?.dailyTaskCount || 0) * 10, 100);
          completed = (userActivity?.dailyTaskCount || 0) >= 10;
          break;
        case 'social_butterfly':
          progress = Math.min((userActivity?.connectionCount || 0) * 20, 100);
          completed = (userActivity?.connectionCount || 0) >= 5;
          break;
        case 'early_adopter':
          progress = userActivity?.isEarlyAdopter ? 100 : 0;
          completed = userActivity?.isEarlyAdopter || false;
          break;
        case 'referral_master':
          progress = Math.min((userActivity?.referralCount || 0) * 20, 100);
          completed = (userActivity?.referralCount || 0) >= 5;
          break;
        case 'task_master':
          progress = Math.min((userActivity?.totalTaskCount || 0) * 2, 100);
          completed = (userActivity?.totalTaskCount || 0) >= 50;
          break;
      }

      return {
        ...achievement,
        progress,
        completed,
      };
    });

    return res.status(200).json(achievements);
  } catch (error) {
    console.error('Error handling achievements request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 