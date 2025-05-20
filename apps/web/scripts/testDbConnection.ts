import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Successfully queried the database. User count: ${userCount}`);
    
    // Test if we can create a test user
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        role: 'BASIC_USER',
      },
    });
    console.log('✅ Successfully created a test user');
    
    // Clean up the test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✅ Successfully deleted the test user');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 