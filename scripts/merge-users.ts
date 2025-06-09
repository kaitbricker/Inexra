import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // TODO: Replace these with your actual user IDs from Prisma Studio
  const MAIN_USER_ID = 'PASTE_MAIN_USER_ID_HERE';
  const EXTRA_USER_ID = 'PASTE_EXTRA_USER_ID_HERE';

  if (MAIN_USER_ID === 'PASTE_MAIN_USER_ID_HERE' || EXTRA_USER_ID === 'PASTE_EXTRA_USER_ID_HERE') {
    throw new Error('Please update MAIN_USER_ID and EXTRA_USER_ID with actual values before running this script.');
  }

  // Move all messages from extra user to main user
  const updated = await prisma.message.updateMany({
    where: { userId: EXTRA_USER_ID },
    data: { userId: MAIN_USER_ID },
  });
  console.log(`Moved ${updated.count} messages to main user.`);

  // Delete the extra user
  await prisma.user.delete({
    where: { id: EXTRA_USER_ID },
  });
  console.log('Deleted extra user.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 