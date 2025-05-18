import { PrismaClient } from '@prisma/client';
import { logger } from '@inexra/shared';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Successfully connected to the database');

    // Test user queries
    const users = await prisma.user.findMany({
      include: {
        socialAccounts: true,
        conversations: {
          include: {
            messages: true,
            leadScore: true,
          },
        },
      },
    });

    logger.info(`Found ${users.length} users`);
    users.forEach(user => {
      logger.info(`User: ${user.name} (${user.email})`);
      logger.info(`Social accounts: ${user.socialAccounts.length}`);
      logger.info(`Conversations: ${user.conversations.length}`);
    });

    // Test conversation queries
    const conversations = await prisma.conversation.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        leadScore: true,
      },
    });

    logger.info(`Found ${conversations.length} active conversations`);
    conversations.forEach(conversation => {
      logger.info(`Conversation ID: ${conversation.id}`);
      logger.info(`Messages: ${conversation.messages.length}`);
      logger.info(`Lead Score: ${conversation.leadScore?.score}`);
    });

    // Test message queries with sentiment analysis
    const messages = await prisma.message.findMany({
      where: {
        sentimentScore: {
          gt: 0.7,
        },
      },
      include: {
        conversation: true,
        socialAccount: true,
      },
    });

    logger.info(`Found ${messages.length} positive messages`);
    messages.forEach(message => {
      logger.info(`Message: ${message.content}`);
      logger.info(`Sentiment Score: ${message.sentimentScore}`);
      logger.info(`Platform: ${message.platform}`);
    });

  } catch (error) {
    logger.error('Database test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testDatabaseConnection()
  .then(() => {
    logger.info('Database tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Database tests failed:', error);
    process.exit(1);
  }); 