export interface MessageAnalysis {
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  keywords: string[];
  intent: string;
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  toxicity: {
    score: number;
    categories: {
      identity_attack: number;
      insult: number;
      obscene: number;
      severe_toxicity: number;
      sexual_explicit: number;
      threat: number;
    };
  };
}
