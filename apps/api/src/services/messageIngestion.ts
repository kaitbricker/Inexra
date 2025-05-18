import { PrismaClient, Platform, SocialAccount, Message, Conversation } from '@prisma/client';
import { getPlatformConfig } from '../config/socialMedia';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { rateLimiter } from '../utils/rateLimiter';
import { OpenAIService } from './openai';
import { WebSocketService } from './websocket';

export class MessageIngestionService {
  private openaiService: OpenAIService;
  private websocketService: WebSocketService;

  constructor(
    private prisma: PrismaClient,
    websocketService: WebSocketService
  ) {
    this.openaiService = new OpenAIService();
    this.websocketService = websocketService;
  }

  async ingestMessages(accountId: string, limit: number = 50): Promise<Message[]> {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new AppError(404, 'Social media account not found', 'NOT_FOUND');
    }

    try {
      // Check if token needs refresh
      if (account.tokenExpiresAt && account.tokenExpiresAt < new Date()) {
        await this.refreshToken(account);
      }

      // Fetch messages based on platform
      const messages = await rateLimiter.withRetry(account.platform, async () => {
        switch (account.platform) {
          case Platform.INSTAGRAM:
            return this.fetchInstagramMessages(account, limit);
          case Platform.LINKEDIN:
            return this.fetchLinkedInMessages(account, limit);
          case Platform.TWITTER:
            return this.fetchTwitterMessages(account, limit);
          default:
            throw new AppError(400, 'Unsupported platform', 'INVALID_PLATFORM');
        }
      });

      // Process messages in batches
      const processedMessages: Message[] = [];
      for (const message of messages) {
        const processedMessage = await this.processMessage(account, message);
        processedMessages.push(processedMessage);
      }

      return processedMessages;
    } catch (error) {
      logger.error(`Error ingesting messages for account ${accountId}:`, error);
      throw new AppError(500, 'Failed to ingest messages', 'INGESTION_ERROR');
    }
  }

  private async processMessage(
    account: SocialAccount,
    message: any
  ): Promise<Message> {
    // Find or create conversation
    const conversation = await this.findOrCreateConversation(account, message);

    // Analyze message with OpenAI
    const analysis = await this.openaiService.analyzeMessage(message.content);

    // Calculate lead score
    const messageFrequency = await this.calculateMessageFrequency(conversation.id);
    const responseTime = await this.calculateAverageResponseTime(conversation.id);
    const leadScore = await this.openaiService.calculateLeadScore(
      analysis.sentimentScore,
      messageFrequency,
      responseTime,
      analysis.keywords
    );

    // Update conversation with new analysis
    const updatedConversation = await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        sentimentSummary: analysis.sentimentScore,
        engagementScore: analysis.urgency,
        leadScore,
        priority: this.getPriorityLevel(leadScore),
      },
    });

    // Emit conversation update
    this.websocketService.emitConversationUpdate(account.userId, updatedConversation);

    // Create or update message
    const processedMessage = await this.prisma.message.upsert({
      where: {
        platform_platformMessageId: {
          platform: account.platform,
          platformMessageId: message.id,
        },
      },
      create: {
        content: message.content,
        platform: account.platform,
        platformMessageId: message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        sentimentScore: analysis.sentimentScore,
        leadScore,
        keywords: analysis.keywords,
        intent: analysis.intent,
        urgency: analysis.urgency,
        socialAccountId: account.id,
        conversationId: conversation.id,
        userId: account.userId,
      },
      update: {
        content: message.content,
        sentimentScore: analysis.sentimentScore,
        leadScore,
        keywords: analysis.keywords,
        intent: analysis.intent,
        urgency: analysis.urgency,
      },
    });

    // Emit message update
    this.websocketService.emitMessageUpdate(account.userId, processedMessage);

    return processedMessage;
  }

  private async findOrCreateConversation(
    account: SocialAccount,
    message: any
  ): Promise<Conversation> {
    // Find existing conversation
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        userId: account.userId,
        messages: {
          some: {
            OR: [
              {
                senderId: message.senderId,
                recipientId: message.recipientId,
              },
              {
                senderId: message.recipientId,
                recipientId: message.senderId,
              },
            ],
          },
        },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    return await this.prisma.conversation.create({
      data: {
        userId: account.userId,
        status: 'OPEN',
        sentimentSummary: 0,
        engagementScore: 0,
        leadScore: 0,
        priority: 'LOW',
      },
    });
  }

  private async calculateMessageFrequency(conversationId: string): Promise<number> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length < 2) return 0;

    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const daysDiff = (lastMessage.createdAt.getTime() - firstMessage.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDiff > 0 ? messages.length / daysDiff : 0;
  }

  private async calculateAverageResponseTime(conversationId: string): Promise<number> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length < 2) return 0;

    let totalResponseTime = 0;
    let responseCount = 0;

    for (let i = 1; i < messages.length; i++) {
      const timeDiff = messages[i].createdAt.getTime() - messages[i - 1].createdAt.getTime();
      totalResponseTime += timeDiff;
      responseCount++;
    }

    return responseCount > 0 ? totalResponseTime / (responseCount * 1000 * 60) : 0; // Convert to minutes
  }

  private getPriorityLevel(leadScore: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (leadScore >= 0.7) return 'HIGH';
    if (leadScore >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  private async fetchInstagramMessages(account: SocialAccount, limit: number) {
    const config = getPlatformConfig(account.platform);
    const response = await fetch(
      `${config.apiBaseUrl}/me/conversations?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Instagram messages: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((message: any) => ({
      id: message.id,
      content: message.text,
      senderId: message.from.id,
      recipientId: message.to.id,
      timestamp: message.created_time,
    }));
  }

  private async fetchLinkedInMessages(account: SocialAccount, limit: number) {
    const config = getPlatformConfig(account.platform);
    const response = await fetch(
      `${config.apiBaseUrl}/messages?count=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn messages: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements.map((message: any) => ({
      id: message.id,
      content: message.message,
      senderId: message.from.id,
      recipientId: message.to.id,
      timestamp: message.created.time,
    }));
  }

  private async fetchTwitterMessages(account: SocialAccount, limit: number) {
    const config = getPlatformConfig(account.platform);
    const response = await fetch(
      `${config.apiBaseUrl}/dm/events?max_results=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Twitter messages: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((message: any) => ({
      id: message.id,
      content: message.text,
      senderId: message.sender_id,
      recipientId: message.recipient_id,
      timestamp: message.created_timestamp,
    }));
  }

  private async refreshToken(account: SocialAccount) {
    // Implement token refresh logic
    throw new Error('Token refresh not implemented');
  }
} 