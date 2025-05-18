import { Configuration, OpenAIApi } from 'openai';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { trackDbOperation } from '@/lib/monitoring';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

interface SentimentAnalysis {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

interface KeywordExtraction {
  keywords: string[];
  relevance: number[];
}

interface LeadScore {
  score: number;
  priority: 'high' | 'medium' | 'low';
  factors: {
    sentiment: number;
    engagement: number;
    responseTime: number;
    messageFrequency: number;
  };
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    const cacheKey = `sentiment:${text}`;
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Analyze the sentiment of the following text and provide a score between -1 and 1, where -1 is very negative and 1 is very positive:\n\n${text}`,
        max_tokens: 100,
        temperature: 0.3,
      });

      const result = response.data.choices[0].text?.trim();
      if (!result) {
        throw new Error('No sentiment analysis result');
      }

      const score = parseFloat(result);
      const analysis: SentimentAnalysis = {
        score,
        label: score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral',
        confidence: Math.abs(score),
      };

      await redis.set(cacheKey, JSON.stringify(analysis), 'EX', 3600);
      return analysis;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  async extractKeywords(text: string): Promise<KeywordExtraction> {
    const cacheKey = `keywords:${text}`;
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Extract the most relevant keywords from the following text and provide their relevance scores (0-1):\n\n${text}`,
        max_tokens: 150,
        temperature: 0.3,
      });

      const result = response.data.choices[0].text?.trim();
      if (!result) {
        throw new Error('No keyword extraction result');
      }

      const lines = result.split('\n');
      const keywords: string[] = [];
      const relevance: number[] = [];

      for (const line of lines) {
        const [keyword, score] = line.split(':').map(s => s.trim());
        if (keyword && score) {
          keywords.push(keyword);
          relevance.push(parseFloat(score));
        }
      }

      const extraction: KeywordExtraction = { keywords, relevance };
      await redis.set(cacheKey, JSON.stringify(extraction), 'EX', 3600);
      return extraction;
    } catch (error) {
      console.error('Error extracting keywords:', error);
      throw error;
    }
  }

  async calculateLeadScore(conversationId: string, messages: any[]): Promise<LeadScore> {
    const start = Date.now();
    try {
      // Calculate engagement score based on message frequency
      const messageFrequency = messages.length / 30; // messages per day
      const engagementScore = Math.min(messageFrequency / 5, 1);

      // Calculate average response time
      const responseTimes = [];
      for (let i = 1; i < messages.length; i++) {
        const timeDiff = messages[i].timestamp.getTime() - messages[i - 1].timestamp.getTime();
        responseTimes.push(timeDiff);
      }
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const responseTimeScore = Math.max(1 - avgResponseTime / (24 * 60 * 60 * 1000), 0);

      // Calculate average sentiment
      const sentiments = await Promise.all(messages.map(msg => this.analyzeSentiment(msg.content)));
      const avgSentiment = sentiments.reduce((a, b) => a + b.score, 0) / sentiments.length;
      const sentimentScore = (avgSentiment + 1) / 2; // Normalize to 0-1

      // Calculate final lead score
      const score = sentimentScore * 0.4 + engagementScore * 0.3 + responseTimeScore * 0.3;

      const leadScore: LeadScore = {
        score,
        priority: score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low',
        factors: {
          sentiment: sentimentScore,
          engagement: engagementScore,
          responseTime: responseTimeScore,
          messageFrequency,
        },
      };

      // Update conversation with lead score
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          leadScore: score,
          priority: leadScore.priority,
        },
      });

      trackDbOperation('update', 'Conversation', Date.now() - start);
      return leadScore;
    } catch (error) {
      console.error('Error calculating lead score:', error);
      throw error;
    }
  }

  async processMessage(messageId: string): Promise<void> {
    const start = Date.now();
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new Error('Message not found');
      }

      // Analyze sentiment and extract keywords
      const [sentiment, keywords] = await Promise.all([
        this.analyzeSentiment(message.content),
        this.extractKeywords(message.content),
      ]);

      // Update message with analysis results
      await prisma.message.update({
        where: { id: messageId },
        data: {
          metadata: {
            sentiment: sentiment.score,
            keywords: keywords.keywords,
          },
        },
      });

      // Recalculate lead score for the conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: message.conversationId },
        include: { messages: true },
      });

      if (conversation) {
        await this.calculateLeadScore(conversation.id, conversation.messages);
      }

      trackDbOperation('update', 'Message', Date.now() - start);
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }
}
