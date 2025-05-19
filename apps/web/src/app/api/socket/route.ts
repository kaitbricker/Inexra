import { NextResponse } from 'next/server';
import { initSocket } from '@/lib/socket';

export async function GET(req: Request) {
  try {
    const res = new NextResponse();
    const io = initSocket(res as any);
    return res;
  } catch (error) {
    console.error('Socket initialization error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
