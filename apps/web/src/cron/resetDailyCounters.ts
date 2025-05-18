import { ActivityService } from '@/services/activity';
import { prisma } from '@/lib/prisma';

export async function resetDailyCounters() {
  try {
    console.log('Starting daily counter reset...');
    await ActivityService.resetDailyCounters();
    console.log('Daily counter reset completed successfully');
  } catch (error) {
    console.error('Error resetting daily counters:', error);
  } finally {
    await prisma.$disconnect();
  }
}
