import { PrismaClient } from '@prisma/client';

const getDatabaseUrl = () => {
  console.log('Environment variables available:', Object.keys(process.env));
  const url = process.env.DATABASE_URL;
  console.log('DATABASE_URL exists:', !!url);
  console.log('DATABASE_URL value:', url ? `${url.substring(0, 20)}...` : 'undefined');
  
  if (!url) {
    console.error('DATABASE_URL is not defined in environment variables');
    throw new Error('DATABASE_URL is not defined');
  }
  
  // Log the first part of the URL for debugging (without sensitive info)
  const urlParts = url.split('@');
  console.log('Database host:', urlParts[1]?.split('/')[0]);
  console.log('URL starts with postgresql://:', url.startsWith('postgresql://'));
  console.log('URL starts with postgres://:', url.startsWith('postgres://'));
  
  // Ensure the URL starts with postgresql://
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    console.error('Invalid DATABASE_URL format:', url.substring(0, 20) + '...');
    throw new Error('DATABASE_URL must start with postgresql:// or postgres://');
  }

  // Check if the URL contains all required parts
  const hasProtocol = url.startsWith('postgresql://') || url.startsWith('postgres://');
  const hasUsername = url.includes('@');
  const hasHost = url.includes('.neon.tech');
  const hasDatabase = url.includes('/neondb');
  
  console.log('URL validation:', {
    hasProtocol,
    hasUsername,
    hasHost,
    hasDatabase
  });

  return url;
};

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  console.log('Creating new Prisma client...');
  const client = new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: ['error', 'warn', 'query'],
  });

  // Test the connection
  client.$connect()
    .then(() => console.log('Successfully connected to the database'))
    .catch((error) => {
      console.error('Failed to connect to the database:', error);
      throw error;
    });

  return client;
};

const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
