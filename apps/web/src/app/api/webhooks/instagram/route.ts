import { NextResponse } from 'next/server';
import { InstagramService } from '@/services/social/instagram';
import { PrismaClient } from '@prisma/client';
import { verifyInstagramSignature, validateInstagramWebhookPayload } from '@/utils/instagram';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Verify webhook signature
    const signature = req.headers.get('x-hub-signature');
    if (!signature) {
      return new NextResponse('Missing signature', { status: 401 });
    }

    // Get the raw body for signature verification
    const rawBody = await req.text();

    // Verify the webhook signature
    const isValid = verifyInstagramSignature(
      rawBody,
      signature,
      process.env.INSTAGRAM_APP_SECRET || ''
    );

    if (!isValid) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Validate the payload structure
    if (!validateInstagramWebhookPayload(payload)) {
      return new NextResponse('Invalid payload', { status: 400 });
    }

    // Handle webhook verification
    if (payload.mode === 'subscribe' && payload['hub.challenge']) {
      return new NextResponse(payload['hub.challenge']);
    }

    // Get the social account for this webhook
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        platform: 'instagram',
        // TODO: Add more specific identification if needed
      },
    });

    if (!socialAccount) {
      return new NextResponse('Social account not found', { status: 404 });
    }

    // Process the webhook
    const instagramService = new InstagramService(socialAccount.accessToken, socialAccount.id);

    await instagramService.handleWebhook(payload);

    return new NextResponse('OK');
  } catch (error) {
    console.error('Error handling Instagram webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  // Handle webhook verification
  const searchParams = new URL(req.url).searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return new NextResponse('Forbidden', { status: 403 });
}
