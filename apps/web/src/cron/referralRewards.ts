import { prisma } from '@/lib/prisma';
import { ReferralService } from '@/services/referral';
import { sendEmail } from '@/services/email';

export async function processReferralRewards() {
  try {
    // Find all active referrals that are eligible for rewards
    const activeReferrals = await prisma.referral.findMany({
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

    console.log(`Found ${activeReferrals.length} active referrals to process`);

    for (const referral of activeReferrals) {
      try {
        // Check if referred user has completed their profile
        const referredUser = referral.referred;
        if (!referredUser) continue;

        const hasCompletedProfile = await checkProfileCompletion(referredUser.id);
        if (!hasCompletedProfile) continue;

        // Process the referral reward
        await ReferralService.processReferral(referral.id);
        console.log(`Processed reward for referral ${referral.id}`);
      } catch (error) {
        console.error(`Error processing referral ${referral.id}:`, error);
        continue;
      }
    }

    // Send reminder emails for pending referrals
    await sendReferralReminders();
  } catch (error) {
    console.error('Error in referral rewards cron job:', error);
  }
}

async function checkProfileCompletion(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profile: true,
      preferences: true,
    },
  });

  if (!user) return false;

  // Check if user has completed their profile
  const hasProfile = !!user.profile;
  const hasPreferences = !!user.preferences;

  return hasProfile && hasPreferences;
}

async function sendReferralReminders() {
  try {
    // Find users with pending referrals
    const usersWithPendingReferrals = await prisma.user.findMany({
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

    console.log(`Found ${usersWithPendingReferrals.length} users with pending referrals`);

    for (const user of usersWithPendingReferrals) {
      try {
        // Send reminder email
        await sendEmail(user, 'referralReminder');
        console.log(`Sent reminder email to user ${user.id}`);
      } catch (error) {
        console.error(`Error sending reminder to user ${user.id}:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error('Error sending referral reminders:', error);
  }
}
