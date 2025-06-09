import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

interface Message {
  content?: string;
  message?: string;
  text?: string;
  sender?: string;
  from?: string;
  timestamp?: string;
  date?: string;
  created_at?: string;
}

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request as any });
    
    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    const user = await prisma.user.upsert({
      where: { id: token.sub },
      update: {},
      create: {
        id: token.sub,
        name: token.name as string,
        email: token.email as string,
        image: token.picture as string,
      },
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const platform = formData.get('platform') as string;

    if (!file || !platform) {
      return NextResponse.json(
        { error: 'File and platform are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'json'].includes(fileType || '')) {
      return NextResponse.json(
        { error: 'Only CSV and JSON files are supported' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();
    let messages: Message[] = [];

    // Parse file content based on type
    if (fileType === 'json') {
      const parsed = JSON.parse(content);
      console.log('Parsed JSON:', parsed);
      console.log('Is Array?', Array.isArray(parsed));
      console.log('Has messages?', parsed?.messages);
      
      if (!parsed) {
        throw new Error('Invalid JSON file: Empty content');
      }
      
      if (Array.isArray(parsed)) {
        messages = parsed;
      } else if (parsed.messages && Array.isArray(parsed.messages)) {
        messages = parsed.messages;
      } else {
        throw new Error('Invalid JSON format: Expected an array or an object with a messages array');
      }
      
      console.log('Final messages array:', messages);
    } else if (fileType === 'csv') {
      // Basic CSV parsing - you might want to use a library like papaparse for production
      const lines = content.split('\n');
      if (lines.length < 2) {
        throw new Error('Invalid CSV file: No data rows found');
      }
      
      const headers = lines[0].split(',');
      messages = lines.slice(1).map((line: string) => {
        const values = line.split(',');
        return headers.reduce((obj: Record<string, string>, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {});
      });
    }

    if (messages.length === 0) {
      throw new Error('No messages found in the file');
    }

    // Transform and insert messages
    const transformedMessages = messages.map(msg => ({
      content: msg.content || msg.message || msg.text || '',
      timestamp: new Date(msg.timestamp || msg.date || msg.created_at || new Date()),
      platform,
      userId: user.id,
      sentiment: 'Neutral', // Default sentiment
      status: 'New',
      tags: [],
      hasInsight: false,
      sender: msg.sender || msg.from || 'unknown'
    }));

    // Insert messages in batches
    const batchSize = 100;
    for (let i = 0; i < transformedMessages.length; i += batchSize) {
      const batch = transformedMessages.slice(i, i + batchSize);
      await prisma.message.createMany({
        data: batch,
        skipDuplicates: true
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${transformedMessages.length} messages from ${platform}`,
      accountName: platform // Add account name for the frontend
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process upload' },
      { status: 500 }
    );
  }
} 