import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { RecommendationItem } from './RecommendationItem';

interface RecommendationEntry {
  key: string;
  title: string;
  description: string;
  severity: 'minor' | 'critical';
  affectedPages: string[];
}

interface ScanRecommendationsProps {
  recs: RecommendationEntry[];
}

export function ScanRecommendations({ recs }: ScanRecommendationsProps) {
  if (recs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-text-primary">Recommendations ({recs.length})</h2>
      </CardHeader>
      <div className="space-y-3">
        {recs.map(rec => (
          <RecommendationItem
            key={rec.key}
            title={rec.title}
            description={rec.description}
            severity={rec.severity}
            affectedPages={rec.affectedPages}
          />
        ))}
      </div>
    </Card>
  );
}
