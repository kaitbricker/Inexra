import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return new NextResponse('Socket route is working', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return new NextResponse('Socket initialization failed', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
