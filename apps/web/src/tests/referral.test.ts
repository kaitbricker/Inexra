import { prisma } from '@/lib/prisma';
import { ReferralService } from '@/services/referral';
import { processReferralRewards } from '@/cron/referralRewards';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    referral: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/services/email', () => ({
  sendEmail: jest.fn(),
}));

describe('ReferralService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processReferral', () => {
    it('should process a valid referral and update rewards', async () => {
      const mockReferral = {
        id: '1',
        referrerId: 'user1',
        status: 'active',
        referrer: {
          id: 'user1',
          email: 'referrer@example.com',
        },
      };

      const mockReward = {
        baseAmount: 10,
        bonusAmount: 5,
        totalAmount: 15,
      };

      (prisma.referral.findUnique as jest.Mock).mockResolvedValue(mockReferral);
      (prisma.referral.count as jest.Mock).mockResolvedValue(6);
      (prisma.referral.update as jest.Mock).mockResolvedValue({ ...mockReferral, status: 'completed' });
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'user1', balance: 15 });

      await ReferralService.processReferral('1');

      expect(prisma.referral.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: 'completed',
          reward: 15,
        },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: {
          balance: {
            increment: 15,
          },
        },
      });
    });

    it('should throw error for non-existent referral', async () => {
      (prisma.referral.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(ReferralService.processReferral('1')).rejects.toThrow('Referral not found');
    });

    it('should throw error for already completed referral', async () => {
      const mockReferral = {
        id: '1',
        status: 'completed',
      };

      (prisma.referral.findUnique as jest.Mock).mockResolvedValue(mockReferral);

      await expect(ReferralService.processReferral('1')).rejects.toThrow('Referral already processed');
    });
  });

  describe('calculateReward', () => {
    it('should calculate base reward for new referrers', async () => {
      (prisma.referral.count as jest.Mock).mockResolvedValue(0);

      const reward = await ReferralService.calculateReward('user1');

      expect(reward).toEqual({
        baseAmount: 10,
        bonusAmount: 0,
        totalAmount: 10,
      });
    });

    it('should include bonus for experienced referrers', async () => {
      (prisma.referral.count as jest.Mock).mockResolvedValue(6);

      const reward = await ReferralService.calculateReward('user1');

      expect(reward).toEqual({
        baseAmount: 10,
        bonusAmount: 5,
        totalAmount: 15,
      });
    });
  });
});

describe('Referral Rewards Cron Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process eligible referrals', async () => {
    const mockActiveReferrals = [
      {
        id: '1',
        referred: {
          id: 'user2',
        },
      },
    ];

    (prisma.referral.findMany as jest.Mock).mockResolvedValue(mockActiveReferrals);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      profile: true,
      preferences: true,
    });

    await processReferralRewards();

    expect(prisma.referral.findMany).toHaveBeenCalledWith({
      where: {
        status: 'active',
        referred: {
          isNot: null,
        },
      },
      include: {
        referrer: true,
        referred: true,
      },
    });
  });

  it('should send reminders for pending referrals', async () => {
    const mockUsers = [
      {
        id: 'user1',
        referrals: [{ id: '1', status: 'pending' }],
      },
    ];

    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    await processReferralRewards();

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        referrals: {
          some: {
            status: 'pending',
          },
        },
      },
      include: {
        referrals: {
          where: {
            status: 'pending',
          },
        },
      },
    });
  });
}); 