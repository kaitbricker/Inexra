export interface MessageAnalysis {
  sentiment: {
    score: number; // -1 to 1, where -1 is negative, 0 is neutral, and 1 is positive
    label: 'positive' | 'negative' | 'neutral';
    confidence: number; // 0 to 1
  };
  keywords: {
    text: string;
    relevance: number; // 0 to 1
  }[];
  intent: {
    type: 'question' | 'statement' | 'request' | 'greeting' | 'farewell' | 'other';
    confidence: number; // 0 to 1
    entities?: {
      type: string;
      text: string;
      confidence: number;
    }[];
  };
  language: {
    code: string;
    confidence: number;
  };
  toxicity: {
    score: number; // 0 to 1
    label: 'safe' | 'toxic';
    categories?: {
      [key: string]: number; // e.g., { "hate": 0.1, "harassment": 0.2 }
    };
  };
  metadata: {
    processingTime: number;
    modelVersion: string;
    timestamp: string;
  };
}
