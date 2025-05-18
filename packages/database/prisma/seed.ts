import { PrismaClient, UserRole, Platform, ConversationStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@inexra.com',
      name: 'Admin User',
      passwordHash: await hash('admin123', 10),
      role: UserRole.ADMIN,
    },
  });

  const creatorUser = await prisma.user.create({
    data: {
      email: 'creator@inexra.com',
      name: 'Creator User',
      passwordHash: await hash('creator123', 10),
      role: UserRole.CREATOR,
    },
  });

  // Create social media accounts
  const instagramAccount = await prisma.socialAccount.create({
    data: {
      platform: Platform.INSTAGRAM,
      platformUserId: 'instagram123',
      accessToken: 'test_access_token',
      refreshToken: 'test_refresh_token',
      userId: creatorUser.id,
      metadata: {
        username: 'test_instagram',
        profilePicture: 'https://example.com/profile.jpg',
      },
    },
  });

  // Create conversations
  const conversation1 = await prisma.conversation.create({
    data: {
      userId: creatorUser.id,
      status: ConversationStatus.ACTIVE,
      sentimentSummary: 0.8,
      engagementScore: 0.9,
    },
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      userId: creatorUser.id,
      status: ConversationStatus.OPEN,
      sentimentSummary: 0.3,
      engagementScore: 0.4,
    },
  });

  // Create messages
  await prisma.message.createMany({
    data: [
      {
        content: 'Hello! I\'m interested in your services.',
        platform: Platform.INSTAGRAM,
        platformMessageId: 'msg1',
        senderId: 'customer1',
        recipientId: creatorUser.id,
        sentimentScore: 0.8,
        leadScore: 0.9,
        keywords: ['interested', 'services'],
        socialAccountId: instagramAccount.id,
        conversationId: conversation1.id,
        userId: creatorUser.id,
      },
      {
        content: 'Can you tell me more about your pricing?',
        platform: Platform.INSTAGRAM,
        platformMessageId: 'msg2',
        senderId: 'customer1',
        recipientId: creatorUser.id,
        sentimentScore: 0.7,
        leadScore: 0.8,
        keywords: ['pricing', 'information'],
        socialAccountId: instagramAccount.id,
        conversationId: conversation1.id,
        userId: creatorUser.id,
      },
      {
        content: 'I\'m not sure if this is what I need.',
        platform: Platform.INSTAGRAM,
        platformMessageId: 'msg3',
        senderId: 'customer2',
        recipientId: creatorUser.id,
        sentimentScore: 0.3,
        leadScore: 0.4,
        keywords: ['unsure', 'needs'],
        socialAccountId: instagramAccount.id,
        conversationId: conversation2.id,
        userId: creatorUser.id,
      },
    ],
  });

  // Create lead scores
  await prisma.leadScore.createMany({
    data: [
      {
        score: 0.9,
        priorityLevel: 1,
        nextAction: 'Follow up with pricing details',
        sentimentTrend: { trend: 'positive' },
        engagementMetrics: { responseTime: 'fast' },
        conversationId: conversation1.id,
      },
      {
        score: 0.4,
        priorityLevel: 3,
        nextAction: 'Send more information about services',
        sentimentTrend: { trend: 'neutral' },
        engagementMetrics: { responseTime: 'slow' },
        conversationId: conversation2.id,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 