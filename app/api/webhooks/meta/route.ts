import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === 'inexra2025') {
    return new Response(challenge, { status: 200 });
  } else {
    return new Response('Forbidden', { status: 403 });
  }
} 