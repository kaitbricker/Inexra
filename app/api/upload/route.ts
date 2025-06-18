import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTagsFromClaude } from '@/lib/ai/claudeTagger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string || '';

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Here you would typically upload the file to your storage service
    // For now, we'll just create a message entry
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;

    // Create content description for AI analysis
    const content = `File Upload: ${fileName}
Type: ${fileType}
Size: ${(fileSize / 1024).toFixed(2)} KB
Description: ${description || 'No description provided'}`;

    // Get AI tags for the uploaded file
    const tags = await getTagsFromClaude(content);

    // Create message with upload source
    const message = await prisma.message.create({
      data: {
        userId: session.user.id!,
        sender: fileName, // Use filename as sender
        content: content,
        tags: tags,
        platform: 'Upload',
        hasInsight: true,
        timestamp: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: message,
      file: {
        name: fileName,
        type: fileType,
        size: fileSize
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to process upload:', error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
} 