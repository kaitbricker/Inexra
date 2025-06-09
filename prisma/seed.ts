import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const TAGS = ['Lead', 'Complaint', 'Collab', 'Technical', 'Positive'] as const;
const SENTIMENTS = ['positive', 'neutral', 'negative'] as const;
const STATUSES = ['Resolved', 'Open'] as const;

function getRandomTags(): string[] {
  const numTags = faker.number.int({ min: 1, max: 3 });
  return faker.helpers.arrayElements(TAGS, numTags);
}

function getRandomSentiment(): string {
  return faker.helpers.arrayElement(SENTIMENTS);
}

function getRandomStatus(): string {
  return faker.helpers.arrayElement(STATUSES);
}

function getRandomDateWithinLast60Days(): Date {
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  return faker.date.between({ from: sixtyDaysAgo, to: now });
}

function getRandomResponseTime(): number {
  // Random response time between 5 minutes and 48 hours
  return faker.number.int({ min: 300, max: 172800 });
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user first
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created test user');

  // Create 50 messages
  const messages = Array.from({ length: 50 }, () => {
    const createdAt = getRandomDateWithinLast60Days();
    const status = getRandomStatus();
    const responseTime = status === 'Resolved' ? getRandomResponseTime() : null;
    const resolvedAt = status === 'Resolved' 
      ? new Date(createdAt.getTime() + (responseTime || 0) * 1000)
      : null;

    return {
      content: faker.lorem.sentence(),
      timestamp: createdAt,
      platform: faker.helpers.arrayElement(['Email', 'Slack', 'Discord', 'Twitter', 'LinkedIn']),
      userId: user.id,
      tags: getRandomTags(),
      createdAt,
      status,
      sentiment: getRandomSentiment(),
      hasInsight: faker.datatype.boolean({ probability: 0.4 }),
      responseTime,
      resolvedAt,
      slaWindow: 86400, // 24 hours in seconds
      sender: 'unknown'
    };
  });

  // Insert messages into database
  for (const message of messages) {
    await prisma.message.create({
      data: message,
    });
  }

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 