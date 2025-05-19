import { Message } from '@prisma/client';
import { OpenAI } from 'openai';
import { MessageAnalysis } from '@/types/analysis';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MessageAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  intent: string;
  leadScore: number;
  topics: string[];
  actionItems: string[];
}

export async function analyzeMessage(message: Message): Promise<MessageAnalysis> {
  const startTime = Date.now();

  try {
    // TODO: Replace with actual AI service calls
    // For now, we'll use mock data
    const analysis: MessageAnalysis = {
      sentiment: {
        score: this.getRandomSentimentScore(),
        label: this.getSentimentLabel(this.getRandomSentimentScore()),
        confidence: Math.random(),
      },
      keywords: this.extractKeywords(message.content),
      intent: {
        type: this.detectIntent(message.content),
        confidence: Math.random(),
        entities: this.extractEntities(message.content),
      },
      language: {
        code: 'en',
        confidence: 0.95,
      },
      toxicity: {
        score: Math.random(),
        label: Math.random() > 0.8 ? 'toxic' : 'safe',
        categories: {
          hate: Math.random() * 0.2,
          harassment: Math.random() * 0.2,
          inappropriate: Math.random() * 0.2,
        },
      },
      metadata: {
        processingTime: Date.now() - startTime,
        modelVersion: this.modelVersion,
        timestamp: new Date().toISOString(),
      },
    };

    return analysis;
  } catch (error) {
    console.error('Error analyzing message:', error);
    throw error;
  }
}

export async function analyzeConversation(messages: Message[]): Promise<{
  overallSentiment: string;
  keyTopics: string[];
  leadScore: number;
  priority: 'high' | 'medium' | 'low';
}> {
  const conversationText = messages.map(m => m.content).join('\n');

  const prompt = `
    Analyze this conversation and provide insights in JSON format:
    "${conversationText}"
    
    Return a JSON object with the following structure:
    {
      "overallSentiment": "positive|negative|neutral",
      "keyTopics": ["topic1", "topic2", ...],
      "leadScore": number between 0-100,
      "priority": "high|medium|low"
    }
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content:
          'You are an AI assistant that analyzes business conversations to identify opportunities and priorities. Always respond in valid JSON format.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  const analysis = completion.choices[0].message.content || '';
  return parseConversationAnalysis(analysis);
}

function parseAnalysis(analysis: string): MessageAnalysis {
  try {
    const parsed = JSON.parse(analysis);
    return {
      sentiment: parsed.sentiment || 'neutral',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      intent: parsed.intent || '',
      leadScore: typeof parsed.leadScore === 'number' ? parsed.leadScore : 0,
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
    };
  } catch (error) {
    console.error('Error parsing message analysis:', error);
    return {
      sentiment: 'neutral',
      keywords: [],
      intent: '',
      leadScore: 0,
      topics: [],
      actionItems: [],
    };
  }
}

function parseConversationAnalysis(analysis: string): {
  overallSentiment: string;
  keyTopics: string[];
  leadScore: number;
  priority: 'high' | 'medium' | 'low';
} {
  try {
    const parsed = JSON.parse(analysis);
    return {
      overallSentiment: parsed.overallSentiment || 'neutral',
      keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
      leadScore: typeof parsed.leadScore === 'number' ? parsed.leadScore : 0,
      priority: ['high', 'medium', 'low'].includes(parsed.priority) ? parsed.priority : 'medium',
    };
  } catch (error) {
    console.error('Error parsing conversation analysis:', error);
    return {
      overallSentiment: 'neutral',
      keyTopics: [],
      leadScore: 0,
      priority: 'medium',
    };
  }
}

export class MessageAnalysisService {
  private static instance: MessageAnalysisService;

  private constructor() {}

  public static getInstance(): MessageAnalysisService {
    if (!MessageAnalysisService.instance) {
      MessageAnalysisService.instance = new MessageAnalysisService();
    }
    return MessageAnalysisService.instance;
  }

  public async analyzeMessage(message: Message): Promise<MessageAnalysis> {
    // TODO: Implement actual AI analysis
    // For now, return mock analysis
    return {
      sentiment: {
        score: 0.8,
        label: 'positive',
        confidence: 0.9,
      },
      keywords: ['hello', 'world'],
      intent: 'greeting',
      entities: [
        {
          text: 'world',
          type: 'noun',
          confidence: 0.9,
        },
      ],
      toxicity: {
        score: 0.1,
        categories: {
          identity_attack: 0.1,
          insult: 0.1,
          obscene: 0.1,
          severe_toxicity: 0.1,
          sexual_explicit: 0.1,
          threat: 0.1,
        },
      },
    };
  }
}
