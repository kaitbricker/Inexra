import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { status: 'ok', message: 'New response, cache cleared!' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST() {
  return NextResponse.json(
    { status: 'ok', message: 'New response, cache cleared!' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
} 