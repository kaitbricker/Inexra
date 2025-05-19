import { PrismaClient, Role, Status } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = Role.ADMIN;
  const userRole = Role.USER;
  const guestRole = Role.GUEST;

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: adminRole,
      status: Status.ACTIVE,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Regular User',
      role: userRole,
      status: Status.ACTIVE,
    },
  });

  // Create templates
  const templates = await Promise.all([
    prisma.template.create({
      data: {
        name: 'Welcome Message',
        category: 'Greeting',
        content: 'Welcome to our platform! We\'re excited to have you here.',
        status: Status.ACTIVE,
      },
    }),
    prisma.template.create({
      data: {
        name: 'Follow-up',
        category: 'Engagement',
        content: 'Just checking in to see how things are going.',
        status: Status.ACTIVE,
      },
    }),
  ]);

  // Create conversations
  const conversation = await prisma.conversation.create({
    data: {
      title: 'Initial Discussion',
      status: Status.ACTIVE,
      userId: regularUser.id,
    },
  });

  // Create messages
  await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hello! How can I help you today?',
        userId: adminUser.id,
        conversationId: conversation.id,
      },
    }),
    prisma.message.create({
      data: {
        content: 'I have a question about your services.',
        userId: regularUser.id,
        conversationId: conversation.id,
      },
    }),
  ]);

  // Create social accounts
  await prisma.socialAccount.create({
    data: {
      platform: 'Twitter',
      username: 'user123',
      status: Status.ACTIVE,
      userId: regularUser.id,
    },
  });

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      action: 'USER_CREATED',
      details: { userId: regularUser.id },
      userId: adminUser.id,
    },
  });

  // Create template usage
  await prisma.templateUsage.create({
    data: {
      templateId: templates[0].id,
      userId: regularUser.id,
      responseRate: 0.85,
      conversionRate: 0.65,
    },
  });

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 