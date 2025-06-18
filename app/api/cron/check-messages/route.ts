import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InstagramService } from '@/lib/instagram';
import { getTagsFromClaude } from '@/lib/ai/claudeTagger';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Verify cron secret to ensure only authorized calls
function verifyCronSecret(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(req)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all active platform connections
    const connections = await prisma.platformConnection.findMany({
      where: {
        platform: 'Instagram', // Add other platforms as needed
      },
    });

    let processedCount = 0;

    // Process each connection
    for (const connection of connections) {
      try {
        // Initialize platform-specific service
        const instagramService = new InstagramService(connection.accessToken);
        
        // Get latest messages
        const messages = await instagramService.getMessages(50);
        
        // Process each message
        for (const message of messages) {
          // Check if message already exists
          const existingMessage = await prisma.message.findFirst({
            where: {
              id: message.id,
              platform: 'Instagram',
            },
          });

          if (!existingMessage) {
            // Get tags from Claude
            const tags = await getTagsFromClaude(message.text);
            
            // Create new message
            await prisma.message.create({
              data: {
                id: message.id,
                content: message.text,
                sender: message.sender.username,
                platform: 'Instagram',
                timestamp: new Date(message.timestamp * 1000),
                userId: connection.userId,
                tags,
                status: 'New',
                hasInsight: true,
              },
            });
            
            processedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing messages for connection ${connection.id}:`, error);
        // Continue with next connection
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
    });
  } catch (error) {
    console.error('Error in message check cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 