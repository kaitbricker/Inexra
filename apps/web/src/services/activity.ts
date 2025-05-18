import { prisma } from '@/lib/prisma';
import { sendEmail } from './email';

export class ActivityService {
  static async trackUserActivity(userId: string, activityType: string) {
    try {
      const userActivity = await prisma.userActivity.upsert({
        where: { userId },
        update: {
          lastActiveAt: new Date(),
          ...(activityType === 'task' && {
            dailyTaskCount: { increment: 1 },
            totalTaskCount: { increment: 1 },
          }),
          ...(activityType === 'connection' && {
            connectionCount: { increment: 1 },
          }),
          ...(activityType === 'referral' && {
            referralCount: { increment: 1 },
          }),
        },
        create: {
          userId,
          lastActiveAt: new Date(),
          ...(activityType === 'task' && {
            dailyTaskCount: 1,
            totalTaskCount: 1,
          }),
          ...(activityType === 'connection' && {
            connectionCount: 1,
          }),
          ...(activityType === 'referral' && {
            referralCount: 1,
          }),
        },
      });

      // Check for achievements
      await this.checkAchievements(userId, userActivity);

      return userActivity;
    } catch (error) {
      console.error('Error tracking user activity:', error);
      throw error;
    }
  }

  static async checkAchievements(userId: string, activity: any) {
    const achievements = [
      {
        id: 'first_referral',
        condition: () => activity.referralCount === 1,
        points: 100,
      },
      {
        id: 'power_user',
        condition: () => activity.dailyTaskCount >= 10,
        points: 200,
      },
      {
        id: 'social_butterfly',
        condition: () => activity.connectionCount >= 5,
        points: 150,
      },
      {
        id: 'referral_master',
        condition: () => activity.referralCount >= 5,
        points: 500,
      },
      {
        id: 'task_master',
        condition: () => activity.totalTaskCount >= 50,
        points: 250,
      },
    ];

    for (const achievement of achievements) {
      if (achievement.condition()) {
        await this.awardAchievement(userId, achievement.id, achievement.points);
      }
    }
  }

  static async awardAchievement(userId: string, achievementId: string, points: number) {
    try {
      // Check if achievement already awarded
      const existingAchievement = await prisma.achievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId,
          },
        },
      });

      if (existingAchievement) return;

      // Award achievement and points
      await prisma.$transaction([
        prisma.achievement.create({
          data: {
            userId,
            achievementId,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            points: {
              increment: points,
            },
          },
        }),
      ]);

      // Get user for email notification
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        await sendEmail(user, 'achievement', {
          achievementId,
          points,
        });
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  }

  static async resetDailyCounters() {
    try {
      await prisma.userActivity.updateMany({
        data: {
          dailyTaskCount: 0,
        },
      });
    } catch (error) {
      console.error('Error resetting daily counters:', error);
      throw error;
    }
  }

  static async getLeaderboard(limit = 10) {
    try {
      return await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          points: true,
        },
        orderBy: {
          points: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }
}
