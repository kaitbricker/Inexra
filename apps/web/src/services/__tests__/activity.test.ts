import { ActivityService } from '../activity';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    userActivity: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    achievement: {
      create: jest.fn(),
    },
  },
}));

describe('ActivityService', () => {
  let activityService: ActivityService;

  beforeEach(() => {
    activityService = new ActivityService();
    jest.clearAllMocks();
  });

  describe('trackUserActivity', () => {
    it('should track task activity', async () => {
      const userId = 'user123';
      const activityType = 'task';

      await activityService.trackUserActivity(userId, activityType);

      expect(prisma.userActivity.upsert).toHaveBeenCalledWith({
        where: { userId },
        create: {
          userId,
          dailyTaskCount: 1,
          totalTaskCount: 1,
        },
        update: {
          dailyTaskCount: { increment: 1 },
          totalTaskCount: { increment: 1 },
        },
      });
    });

    it('should track referral activity', async () => {
      const userId = 'user123';
      const activityType = 'referral';

      await activityService.trackUserActivity(userId, activityType);

      expect(prisma.userActivity.upsert).toHaveBeenCalledWith({
        where: { userId },
        create: {
          userId,
          referralCount: 1,
        },
        update: {
          referralCount: { increment: 1 },
        },
      });
    });
  });

  describe('checkAchievements', () => {
    it('should award achievement when conditions are met', async () => {
      const userId = 'user123';
      const activity = {
        userId,
        dailyTaskCount: 5,
        totalTaskCount: 10,
        referralCount: 3,
      };

      await activityService.checkAchievements(userId, activity);

      expect(prisma.achievement.create).toHaveBeenCalledWith({
        data: {
          userId,
          achievementId: 'task_master',
          completedAt: expect.any(Date),
        },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { points: { increment: 100 } },
      });
    });
  });

  describe('getLeaderboard', () => {
    it('should return top users by points', async () => {
      const mockUsers = [
        { id: 'user1', name: 'User 1', points: 100 },
        { id: 'user2', name: 'User 2', points: 50 },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await activityService.getLeaderboard(2);

      expect(result).toHaveLength(2);
      expect(result[0].points).toBe(100);
      expect(result[1].points).toBe(50);
    });
  });
});
