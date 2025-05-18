import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { OpenAIService } from '../services/openai';
import passport from 'passport';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Message, Conversation } from '@prisma/client';

const router = Router();
const openaiService = new OpenAIService();
const authenticate = passport.authenticate('jwt', { session: false });

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
  body: any;
  params: {
    [key: string]: string;
  };
  query: {
    [key: string]: string | undefined;
  };
}

interface MessageWithKeywords {
  keywords: string[];
}

// Analyze a single message
router.post('/message', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    if (!content) {
      throw new AppError(400, 'Message content is required', 'MISSING_CONTENT');
    }

    const analysis = await openaiService.analyzeMessage(content);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Get conversation insights
router.get('/conversation/:conversationId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      throw new AppError(404, 'Conversation not found', 'NOT_FOUND');
    }

    // Get conversation analysis
    const analysis = await openaiService.analyzeConversation(
      conversation.messages.map((m: Message) => ({
        content: m.content,
        createdAt: m.createdAt,
      }))
    );

    // Get keyword trends
    const keywordTrends = await getKeywordTrends(conversation.messages);

    res.json({
      ...analysis,
      keywordTrends,
      messageCount: conversation.messages.length,
      lastMessageAt: conversation.messages[conversation.messages.length - 1]?.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// Get user insights
router.get('/user/:userId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify user has access
    if (req.user.id !== userId) {
      throw new AppError(403, 'Unauthorized', 'UNAUTHORIZED');
    }

    const where = {
      userId,
      ...(startDate && endDate
        ? {
            createdAt: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          }
        : {}),
    };

    const [
      conversations,
      totalMessages,
      platformStats,
      sentimentStats,
      keywordStats,
    ] = await Promise.all([
      // Get conversations with analysis
      prisma.conversation.findMany({
        where,
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      }),

      // Total messages
      prisma.message.count({ where }),

      // Messages by platform
      prisma.message.groupBy({
        by: ['platform'],
        where,
        _count: true,
      }),

      // Messages by sentiment
      prisma.message.groupBy({
        by: ['sentimentScore'],
        where,
        _count: true,
      }),

      // Most common keywords
      prisma.message.findMany({
        where,
        select: {
          keywords: true,
        },
      }),
    ]);

    // Analyze conversations
    const conversationAnalyses = await Promise.all(
      conversations.map((conv: Conversation & { messages: Message[] }) =>
        openaiService.analyzeConversation(
          conv.messages.map((m: Message) => ({
            content: m.content,
            createdAt: m.createdAt,
          }))
        )
      )
    );

    // Calculate keyword frequency
    const keywordFrequency = keywordStats.reduce((acc: Record<string, number>, msg: MessageWithKeywords) => {
      msg.keywords.forEach((keyword: string) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
      });
      return acc;
    }, {});

    res.json({
      totalConversations: conversations.length,
      totalMessages,
      platformStats,
      sentimentStats,
      keywordFrequency,
      conversationAnalyses,
      averageSentiment: calculateAverageSentiment(sentimentStats),
      averageLeadScore: calculateAverageLeadScore(conversationAnalyses),
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
async function getKeywordTrends(messages: Message[]) {
  const keywordSets = await Promise.all(
    messages.map(msg => openaiService.extractKeywords(msg.content))
  );

  const trends: Record<string, number[]> = {};
  keywordSets.forEach((keywords, index) => {
    keywords.forEach(keyword => {
      if (!trends[keyword]) {
        trends[keyword] = new Array(messages.length).fill(0);
      }
      trends[keyword][index] = 1;
    });
  });

  return trends;
}

interface SentimentStat {
  sentimentScore: number;
  _count: number;
}

function calculateAverageSentiment(sentimentStats: SentimentStat[]): number {
  const total = sentimentStats.reduce(
    (sum, stat) => sum + stat.sentimentScore * stat._count,
    0
  );
  const count = sentimentStats.reduce((sum, stat) => sum + stat._count, 0);
  return count > 0 ? total / count : 0;
}

interface ConversationAnalysis {
  leadScore: number;
}

function calculateAverageLeadScore(conversationAnalyses: ConversationAnalysis[]): number {
  const total = conversationAnalyses.reduce(
    (sum, analysis) => sum + analysis.leadScore,
    0
  );
  return conversationAnalyses.length > 0
    ? total / conversationAnalyses.length
    : 0;
}

export default router; 