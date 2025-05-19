import { Message, Conversation, PrismaClient, Prisma } from '@prisma/client';
import { analyzeMessage, analyzeConversation, MessageAnalysis } from '../ai/analysis';

const prisma = new PrismaClient();

export async function processNewMessage(message: Message) {
  try {
    // 1. Analyze the individual message
    const messageAnalysis = await analyzeMessage(message);

    // 2. Update the message with analysis metadata
    await prisma.message.update({
      where: { id: message.id },
      data: {
        metadata: {
          sentiment: messageAnalysis.sentiment,
          keywords: messageAnalysis.keywords,
          intent: messageAnalysis.intent,
          leadScore: messageAnalysis.leadScore,
          topics: messageAnalysis.topics,
          actionItems: messageAnalysis.actionItems,
        },
      },
    });

    // 3. Get all messages in the conversation
    const conversationMessages = await prisma.message.findMany({
      where: { conversationId: message.conversationId },
      orderBy: { timestamp: 'asc' },
    });

    // 4. Analyze the entire conversation
    const conversationAnalysis = await analyzeConversation(conversationMessages);

    // 5. Update the conversation with new insights
    await prisma.conversation.update({
      where: { id: message.conversationId },
      data: {
        leadScore: conversationAnalysis.leadScore,
        priority: conversationAnalysis.priority,
        status: determineConversationStatus(conversationAnalysis),
      },
    });

    return {
      messageAnalysis,
      conversationAnalysis,
    };
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
}

function determineConversationStatus(analysis: {
  leadScore: number;
  priority: 'high' | 'medium' | 'low';
}): 'active' | 'archived' | 'closed' {
  // Logic to determine conversation status based on analysis
  if (analysis.leadScore > 80) return 'active';
  if (analysis.leadScore < 20) return 'archived';
  return 'active';
}

export async function getConversationInsights(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const analysis = await analyzeConversation(conversation.messages);

  return {
    ...analysis,
    messageCount: conversation.messages.length,
    lastMessageAt: conversation.messages[conversation.messages.length - 1]?.timestamp,
    currentStatus: conversation.status,
  };
}
