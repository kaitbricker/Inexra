'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageAnalysis as MessageAnalysisType } from '@/types/analysis';
import { Smile, Frown, Meh } from 'lucide-react';

interface MessageAnalysisProps {
  analysis: MessageAnalysisType;
}

export function MessageAnalysis({ analysis }: MessageAnalysisProps) {
  const getSentimentIcon = () => {
    switch (analysis.sentiment.label) {
      case 'positive':
        return <Smile className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <Frown className="w-4 h-4 text-red-500" />;
      default:
        return <Meh className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Sentiment</h3>
          {getSentimentIcon()}
        </div>
        <Progress value={analysis.sentiment.score * 100} />
        <p className="text-xs text-muted-foreground">
          Confidence: {Math.round(analysis.sentiment.confidence * 100)}%
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {analysis.keywords.map((keyword: string) => (
            <span key={keyword} className="px-2 py-1 text-xs bg-secondary rounded-full">
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Intent</h3>
        <p className="text-sm">{analysis.intent}</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Entities</h3>
        <div className="space-y-1">
          {analysis.entities.map((entity: { text: string; type: string; confidence: number }) => (
            <div key={entity.text} className="flex items-center justify-between">
              <span className="text-sm">{entity.text}</span>
              <span className="text-xs text-muted-foreground">
                {entity.type} ({Math.round(entity.confidence * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Toxicity</h3>
        <Progress value={analysis.toxicity.score * 100} />
        <div className="space-y-1">
          {Object.entries(analysis.toxicity.categories).map(
            ([category, score]: [string, number]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm capitalize">{category.replace(/_/g, ' ')}</span>
                <Progress value={score * 100} className="w-24" />
              </div>
            )
          )}
        </div>
      </div>
    </Card>
  );
}
