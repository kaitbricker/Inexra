import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const envVars = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
      // Don't expose sensitive variables
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not Set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not Set',
    };

    return NextResponse.json({
      status: 'success',
      environment: envVars,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking environment:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check environment variables',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 