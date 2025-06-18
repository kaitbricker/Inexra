import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { InstagramService, InstagramMessage } from '@/lib/instagram';
import { prisma } from '@/lib/prisma';
import { getTagsFromClaude } from '@/lib/ai/claudeTagger';
import { getVisibleTags } from '@/lib/utils/tags';

// Mock messages data
let messages = [
  { id: 1, sender: "JD", content: "Interested in enterprise pricing...", tag: "Leads", time: "2m ago" },
  { id: 2, sender: "MS", content: "Service disruption reported...", tag: "Complaints", time: "15m ago" },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') || 'desc';
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Get messages from database with real-time data
    const dbMessages = await prisma.message.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        timestamp: sort === 'desc' ? 'desc' : 'asc',
      },
      take: limit,
    });

    // Get Instagram messages if user has connected their account
    const platformConnection = await prisma.platformConnection.findFirst({
      where: {
        userId: session.user.id,
        platform: 'Instagram',
      },
    });

    let instagramMessages: InstagramMessage[] = [];
    if (platformConnection) {
      try {
        const instagramService = new InstagramService(platformConnection.accessToken);
        instagramMessages = await instagramService.getMessages(limit);
        
        // Process new Instagram messages and save to database
        for (const instagramMsg of instagramMessages) {
          // Check if message already exists in database by checking content and timestamp
          const existingMessage = await prisma.message.findFirst({
            where: {
              userId: session.user.id,
              content: instagramMsg.text,
              timestamp: new Date(instagramMsg.timestamp * 1000),
              platform: 'Instagram'
            }
          });

          if (!existingMessage) {
            // Get AI tags for new message
            const tags = await getTagsFromClaude(instagramMsg.text);
            
            // Save new message to database with Instagram source
            await prisma.message.create({
              data: {
                userId: session.user.id!,
                sender: instagramMsg.sender.username,
                content: instagramMsg.text,
                tags,
                timestamp: new Date(instagramMsg.timestamp * 1000),
                platform: 'Instagram',
                hasInsight: true,
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching Instagram messages:', error);
        // Continue with database messages even if Instagram fails
      }
    }

    // Combine and format all messages with enhanced source tracking
    const allMessages = [
      ...dbMessages.map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        tag: msg.tags[0] || 'General',
        tagColor: getTagColor(msg.tags[0] || 'General'),
        preview: msg.content.substring(0, 100),
        time: msg.timestamp.toISOString(),
        content: msg.content,
        aiContext: msg.hasInsight ? 'This message was analyzed by InexraAI.' : '',
        aiConfidence: msg.hasInsight ? 90 : 0,
        aiSuggestions: msg.hasInsight ? [
          "Thank you for reaching out! I'll get back to you shortly.",
          "I appreciate your message. Let me look into this for you.",
          "Thanks for contacting us. I'll follow up with more details soon."
        ] : undefined,
        tags: msg.tags,
        platform: msg.platform || 'Database',
        source: getSourceDisplay(msg.platform, msg.sender),
        sourceIcon: getSourceIcon(msg.platform),
        sourceColor: getSourceColor(msg.platform),
      })),
    ];

    // Sort messages if needed
    if (sort === 'desc') {
      allMessages.sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      );
    }

    // Set cache headers for real-time data
    const response = NextResponse.json(allMessages);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Last-Updated', new Date().toISOString());

    return response;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function getTagColor(tag: string): string {
  const colors = {
    'Lead': 'bg-green-100 text-green-700',
    'Complaint': 'bg-red-100 text-red-700',
    'Collab': 'bg-purple-100 text-purple-700',
    'Positive': 'bg-blue-100 text-blue-700',
    'Technical': 'bg-yellow-100 text-yellow-700',
    'General': 'bg-gray-100 text-gray-700',
  };
  return colors[tag as keyof typeof colors] || colors.General;
}

function getSourceDisplay(platform: string, sender: string): string {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return `Instagram DM from @${sender}`;
    case 'facebook':
      return `Facebook Message from ${sender}`;
    case 'twitter':
      return `Twitter DM from @${sender}`;
    case 'email':
      return `Email from ${sender}`;
    case 'upload':
      return `File Upload: ${sender}`;
    case 'webhook':
      return `Webhook from ${sender}`;
    default:
      return `Message from ${sender}`;
  }
}

function getSourceIcon(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return '📷';
    case 'facebook':
      return '📘';
    case 'twitter':
      return '🐦';
    case 'email':
      return '📧';
    case 'upload':
      return '📎';
    case 'webhook':
      return '🔗';
    default:
      return '💬';
  }
}

function getSourceColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return 'bg-gradient-to-r from-purple-500 to-pink-500';
    case 'facebook':
      return 'bg-[#1877F3]';
    case 'twitter':
    case 'x':
      return 'bg-[#1DA1F2]';
    case 'linkedin':
      return 'bg-[#0077B5]';
    case 'email':
      return 'bg-indigo-500';
    case 'upload':
      return 'bg-green-500';
    case 'webhook':
      return 'bg-orange-400';
    default:
      return 'bg-gray-500';
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();
    
    // Get AI tags for the message
    const tags = await getTagsFromClaude(data.content);
    
    // Create message with AI tags and source tracking
    const message = await prisma.message.create({
      data: {
        ...data,
        tags,
        userId: session.user.id,
        hasInsight: true,
        platform: data.platform || 'Database', // Ensure platform is set
      }
    });
    
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
} 