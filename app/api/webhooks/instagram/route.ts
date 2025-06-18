import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTagsFromClaude } from '@/lib/ai/claudeTagger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verify webhook signature (implement proper verification)
    const signature = req.headers.get('x-hub-signature-256');
    if (!signature) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Handle different webhook events
    if (body.object === 'instagram' && body.entry) {
      for (const entry of body.entry) {
        if (entry.messaging) {
          for (const message of entry.messaging) {
            await processInstagramMessage(message);
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processInstagramMessage(message: any) {
  try {
    // Extract message data
    const senderId = message.sender.id;
    const messageText = message.message?.text;
    const timestamp = message.timestamp;

    if (!messageText) return;

    // Find the user who owns this Instagram account
    const platformConnection = await prisma.platformConnection.findFirst({
      where: {
        platformUserId: senderId,
        platform: 'Instagram',
      },
    });

    if (!platformConnection) {
      console.log('No platform connection found for sender:', senderId);
      return;
    }

    // Check if message already exists
    const existingMessage = await prisma.message.findFirst({
      where: {
        userId: platformConnection.userId,
        content: messageText,
        timestamp: new Date(timestamp * 1000),
        platform: 'Instagram'
      }
    });

    if (existingMessage) {
      console.log('Message already exists:', messageText);
      return;
    }

    // Get AI tags for the message
    const tags = await getTagsFromClaude(messageText);

    // Save new message to database
    await prisma.message.create({
      data: {
        userId: platformConnection.userId,
        sender: `Instagram User ${senderId}`,
        content: messageText,
        tags,
        timestamp: new Date(timestamp * 1000),
        platform: 'Instagram',
        hasInsight: true,
      }
    });

    console.log('New Instagram message processed:', messageText);
  } catch (error) {
    console.error('Error processing Instagram message:', error);
  }
}

// Webhook verification endpoint
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  // Verify token (should match your webhook verification token)
  const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
} 