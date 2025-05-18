import { resetDailyCounters } from '../src/cron/resetDailyCounters';

async function main() {
  try {
    console.log('Starting daily counter reset...');
    await resetDailyCounters();
    console.log('Daily counter reset completed successfully');
  } catch (error) {
    console.error('Error resetting daily counters:', error);
    process.exit(1);
  }
}

main(); 