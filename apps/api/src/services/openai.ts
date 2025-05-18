import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

interface MessageAnalysis {
  sentimentScore: number;
  keywords: string[];
  intent: string;
  urgency: number;
}

interface ConversationAnalysis {
  sentimentTrend: number;
  engagementScore: number;
  leadScore: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  keyTopics: string[];
}

export class OpenAIService {
  private openai: OpenAI | null = null;
  private cache: Map<string, any> = new Map();

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      logger.warn('OPENAI_API_KEY is not set. AI features will be disabled.');
    }
  }

  private async callOpenAI(prompt: string, maxTokens: number): Promise<any> {
    if (!this.openai) {
      // Return mock data when OpenAI is not configured
      return {
        sentimentScore: 0,
        keywords: [],
        intent: 'OTHER',
        urgency: 0.5,
        sentimentTrend: 0,
        engagementScore: 0.5,
        leadScore: 0.5,
        priority: 'MEDIUM',
        keyTopics: []
      };
    }

    try {
      const response = await this.openai.completions.create({
        model: "text-davinci-003",
        prompt,
        max_tokens: maxTokens,
        temperature: 0.3,
      });
      return JSON.parse(response.choices[0].text?.trim() || '{}');
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw new AppError(500, 'Failed to call OpenAI API', 'API_ERROR');
    }
  }

  async analyzeMessage(content: string): Promise<MessageAnalysis> {
    try {
      const cacheKey = `message_${content}`;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      const prompt = `Analyze the following message for sentiment, keywords, intent, and urgency. 
      Return a JSON object with:
      - sentimentScore: number between -1 (negative) and 1 (positive)
      - keywords: array of relevant keywords
      - intent: one of [INQUIRY, COMPLAINT, FEEDBACK, SUPPORT, OTHER]
      - urgency: number between 0 (low) and 1 (high)

      Message: "${content}"`;

      const analysis = await this.callOpenAI(prompt, 150);
      this.cache.set(cacheKey, analysis);
      return analysis;
    } catch (error) {
      logger.error('Error analyzing message:', error);
      throw new AppError(500, 'Failed to analyze message', 'ANALYSIS_ERROR');
    }
  }

  async analyzeConversation(messages: { content: string; createdAt: Date }[]): Promise<ConversationAnalysis> {
    try {
      const cacheKey = `conversation_${messages.map(m => m.content).join('_')}`;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      const prompt = `Analyze the following conversation for sentiment trend, engagement, lead potential, and key topics.
      Return a JSON object with:
      - sentimentTrend: number between -1 (declining) and 1 (improving)
      - engagementScore: number between 0 (low) and 1 (high)
      - leadScore: number between 0 (low) and 1 (high)
      - priority: one of [HIGH, MEDIUM, LOW]
      - keyTopics: array of main topics discussed

      Conversation:
      ${messages.map(m => `[${m.createdAt.toISOString()}] ${m.content}`).join('\n')}`;

      const analysis = await this.callOpenAI(prompt, 200);
      this.cache.set(cacheKey, analysis);
      return analysis;
    } catch (error) {
      logger.error('Error analyzing conversation:', error);
      throw new AppError(500, 'Failed to analyze conversation', 'ANALYSIS_ERROR');
    }
  }

  async extractKeywords(content: string): Promise<string[]> {
    try {
      const cacheKey = `keywords_${content}`;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      const prompt = `Extract the most relevant keywords from the following text. 
      Return a JSON array of keywords.

      Text: "${content}"`;

      const keywords = await this.callOpenAI(prompt, 100);
      this.cache.set(cacheKey, keywords);
      return keywords;
    } catch (error) {
      logger.error('Error extracting keywords:', error);
      throw new AppError(500, 'Failed to extract keywords', 'ANALYSIS_ERROR');
    }
  }

  async calculateLeadScore(
    sentimentScore: number,
    messageFrequency: number,
    responseTime: number,
    keywords: string[]
  ): Promise<number> {
    try {
      const prompt = `Calculate a lead score based on the following factors:
      - Sentiment Score: ${sentimentScore} (range: -1 to 1)
      - Message Frequency: ${messageFrequency} messages per day
      - Average Response Time: ${responseTime} minutes
      - Keywords: ${JSON.stringify(keywords)}

      Return a number between 0 (low potential) and 1 (high potential).`;

      const score = await this.callOpenAI(prompt, 50);
      return parseFloat(score.toString());
    } catch (error) {
      logger.error('Error calculating lead score:', error);
      throw new AppError(500, 'Failed to calculate lead score', 'ANALYSIS_ERROR');
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
} 