import { prisma } from '@/lib/prisma';
import { sendEmail } from './email';

interface ReferralReward {
  baseAmount: number;
  bonusAmount: number;
  totalAmount: number;
}

export class ReferralService {
  private static readonly BASE_REWARD = 10.00;
  private static readonly BONUS_THRESHOLD = 5;
  private static readonly BONUS_AMOUNT = 5.00;

  static async processReferral(referralId: string): Promise<void> {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { referrer: true },
    });

    if (!referral) {
      throw new Error('Referral not found');
    }

    if (referral.status === 'completed') {
      throw new Error('Referral already processed');
    }

    // Calculate reward
    const reward = await this.calculateReward(referral.referrerId);

    // Update referral status and reward
    await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'completed',
        reward: reward.totalAmount,
      },
    });

    // Update referrer's balance
    await prisma.user.update({
      where: { id: referral.referrerId },
      data: {
        balance: {
          increment: reward.totalAmount,
        },
      },
    });

    // Send reward notification email
    await sendEmail(referral.referrer, 'referralReward', {
      amount: reward.totalAmount,
      referralEmail: referral.email,
    });
  }

  static async calculateReward(referrerId: string): Promise<ReferralReward> {
    const totalReferrals = await prisma.referral.count({
      where: {
        referrerId,
        status: 'completed',
      },
    });

    const baseAmount = this.BASE_REWARD;
    const bonusAmount = totalReferrals >= this.BONUS_THRESHOLD ? this.BONUS_AMOUNT : 0;
    const totalAmount = baseAmount + bonusAmount;

    return {
      baseAmount,
      bonusAmount,
      totalAmount,
    };
  }

  static async activateReferral(referralId: string, referredUserId: string): Promise<void> {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral) {
      throw new Error('Referral not found');
    }

    if (referral.status !== 'pending') {
      throw new Error('Referral is not in pending status');
    }

    // Update referral status and link to referred user
    await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'active',
        referredId: referredUserId,
      },
    });

    // Send activation notification email
    await sendEmail(referral.referrer, 'referralActivated', {
      referralEmail: referral.email,
    });
  }

  static async getReferralStats(userId: string) {
    const [totalReferrals, activeReferrals, completedReferrals] = await Promise.all([
      prisma.referral.count({
        where: { referrerId: userId },
      }),
      prisma.referral.count({
        where: {
          referrerId: userId,
          status: 'active',
        },
      }),
      prisma.referral.count({
        where: {
          referrerId: userId,
          status: 'completed',
        },
      }),
    ]);

    const totalRewards = await prisma.referral.aggregate({
      where: {
        referrerId: userId,
        status: 'completed',
      },
      _sum: {
        reward: true,
      },
    });

    return {
      totalReferrals,
      activeReferrals,
      completedReferrals,
      totalRewards: totalRewards._sum.reward || 0,
    };
  }
} 