import { PrismaClient } from '@prisma/client';
import { logger } from '@inexra/shared';

const prisma = new PrismaClient();

async function validateDatabase() {
  try {
    // Validate user data
    const users = await prisma.user.findMany();
    logger.info(`Validating ${users.length} users...`);
    
    for (const user of users) {
      // Check required fields
      if (!user.email || !user.name || !user.passwordHash) {
        throw new Error(`Invalid user data for user ${user.id}: missing required fields`);
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        throw new Error(`Invalid email format for user ${user.id}: ${user.email}`);
      }

      // Check password hash format
      if (!user.passwordHash.startsWith('$2')) {
        throw new Error(`Invalid password hash format for user ${user.id}`);
      }
    }

    // Validate social accounts
    const socialAccounts = await prisma.socialAccount.findMany();
    logger.info(`Validating ${socialAccounts.length} social accounts...`);

    for (const account of socialAccounts) {
      // Check required fields
      if (!account.platform || !account.platformUserId || !account.accessToken) {
        throw new Error(`Invalid social account data for account ${account.id}: missing required fields`);
      }

      // Check platform enum values
      const validPlatforms = ['INSTAGRAM', 'LINKEDIN', 'TWITTER'];
      if (!validPlatforms.includes(account.platform)) {
        throw new Error(`Invalid platform for account ${account.id}: ${account.platform}`);
      }

      // Check token expiration
      if (account.tokenExpiresAt && account.tokenExpiresAt < new Date()) {
        logger.warn(`Expired token for account ${account.id}`);
      }
    }

    // Validate conversations
    const conversations = await prisma.conversation.findMany();
    logger.info(`Validating ${conversations.length} conversations...`);

    for (const conversation of conversations) {
      // Check required fields
      if (!conversation.userId || !conversation.status) {
        throw new Error(`Invalid conversation data for conversation ${conversation.id}: missing required fields`);
      }

      // Check status enum values
      const validStatuses = ['ACTIVE', 'OPEN', 'CLOSED', 'ARCHIVED'];
      if (!validStatuses.includes(conversation.status)) {
        throw new Error(`Invalid status for conversation ${conversation.id}: ${conversation.status}`);
      }

      // Check sentiment and engagement scores
      if (conversation.sentimentSummary < 0 || conversation.sentimentSummary > 1) {
        throw new Error(`Invalid sentiment score for conversation ${conversation.id}: ${conversation.sentimentSummary}`);
      }
      if (conversation.engagementScore < 0 || conversation.engagementScore > 1) {
        throw new Error(`Invalid engagement score for conversation ${conversation.id}: ${conversation.engagementScore}`);
      }
    }

    // Validate messages
    const messages = await prisma.message.findMany();
    logger.info(`Validating ${messages.length} messages...`);

    for (const message of messages) {
      // Check required fields
      if (!message.content || !message.platform || !message.senderId || !message.recipientId) {
        throw new Error(`Invalid message data for message ${message.id}: missing required fields`);
      }

      // Check sentiment and lead scores
      if (message.sentimentScore < 0 || message.sentimentScore > 1) {
        throw new Error(`Invalid sentiment score for message ${message.id}: ${message.sentimentScore}`);
      }
      if (message.leadScore < 0 || message.leadScore > 1) {
        throw new Error(`Invalid lead score for message ${message.id}: ${message.leadScore}`);
      }

      // Check keywords array
      if (!Array.isArray(message.keywords)) {
        throw new Error(`Invalid keywords format for message ${message.id}`);
      }
    }

    // Validate lead scores
    const leadScores = await prisma.leadScore.findMany();
    logger.info(`Validating ${leadScores.length} lead scores...`);

    for (const score of leadScores) {
      // Check required fields
      if (!score.conversationId || score.score === undefined) {
        throw new Error(`Invalid lead score data for score ${score.id}: missing required fields`);
      }

      // Check score range
      if (score.score < 0 || score.score > 1) {
        throw new Error(`Invalid score value for lead score ${score.id}: ${score.score}`);
      }

      // Check priority level
      if (score.priorityLevel < 1 || score.priorityLevel > 5) {
        throw new Error(`Invalid priority level for lead score ${score.id}: ${score.priorityLevel}`);
      }

      // Check sentiment trend
      if (score.sentimentTrend && typeof score.sentimentTrend !== 'object') {
        throw new Error(`Invalid sentiment trend format for lead score ${score.id}`);
      }

      // Check engagement metrics
      if (score.engagementMetrics && typeof score.engagementMetrics !== 'object') {
        throw new Error(`Invalid engagement metrics format for lead score ${score.id}`);
      }
    }

    logger.info('Database validation completed successfully');
  } catch (error) {
    logger.error('Database validation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the validation
validateDatabase()
  .then(() => {
    logger.info('Database validation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Database validation failed:', error);
    process.exit(1);
  }); 