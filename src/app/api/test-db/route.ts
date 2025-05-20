import { NextResponse } from 'next/server';
import { prisma } from 'apps/web/src/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Log the database URL for debugging (do not expose in production!)
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    // Try a simple query
    const users = await prisma.user.findMany({ take: 1 });
    return NextResponse.json({ status: 'success', message: 'Database connection successful!', users });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ status: 'error', message: 'Database connection failed', error: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 