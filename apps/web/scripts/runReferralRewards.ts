import { processReferralRewards } from '../src/cron/referralRewards';
import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    console.log('Starting referral rewards processing...');
    await processReferralRewards();
    console.log('Referral rewards processing completed successfully');
  } catch (error) {
    console.error('Error processing referral rewards:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 