import { useState, useEffect } from 'react';
import { TemplateAnalytics, Template } from '../types';

interface UseTemplateAnalyticsProps {
  initialData?: Record<string, TemplateAnalytics>;
}

interface CategoryPerformance {
  usageCount: number;
  avgResponseTime: number;
  engagementRate: number;
  conversionRate: number;
}

export const useTemplateAnalytics = ({ initialData = {} }: UseTemplateAnalyticsProps = {}) => {
  const [analytics, setAnalytics] = useState<Record<string, TemplateAnalytics>>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch template analytics');
      }
      const data = await response.json() as Record<string, TemplateAnalytics>;
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const updateAnalytics = async (templateId: string, updates: Partial<TemplateAnalytics>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/${templateId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update template analytics');
      }

      const updatedAnalytics = await response.json() as TemplateAnalytics;
      setAnalytics((prev) => {
        const currentAnalytics = prev[templateId];
        if (!currentAnalytics) {
          return {
            ...prev,
            [templateId]: updatedAnalytics,
          };
        }
        return {
          ...prev,
          [templateId]: {
            ...currentAnalytics,
            ...updatedAnalytics,
          },
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const getTopTemplates = (limit = 5): Array<TemplateAnalytics & { id: string }> => {
    return Object.entries(analytics)
      .sort(([, a], [, b]) => ((b as TemplateAnalytics).usageCount || 0) - ((a as TemplateAnalytics).usageCount || 0))
      .slice(0, limit)
      .map(([id, data]) => ({ id, ...data }));
  };

  const getCategoryPerformance = (): Record<string, CategoryPerformance> => {
    return Object.entries(analytics).reduce((acc, [, data]) => {
      const templateData = data as TemplateAnalytics;
      const category = templateData.categoryStats?.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = {
          usageCount: 0,
          avgResponseTime: 0,
          engagementRate: 0,
          conversionRate: 0,
        };
      }
      acc[category].usageCount += templateData.usageCount || 0;
      acc[category].avgResponseTime += templateData.avgResponseTime || 0;
      acc[category].engagementRate += templateData.engagementRate || 0;
      acc[category].conversionRate += templateData.conversionRate || 0;
      return acc;
    }, {} as Record<string, CategoryPerformance>);
  };

  interface TimeDataPoint {
    time?: string;
    date?: string;
    week?: string;
    month?: string;
    value: number;
  }

  interface TimeStats {
    hourly: TimeDataPoint[];
    daily: TimeDataPoint[];
    weekly: TimeDataPoint[];
    monthly: TimeDataPoint[];
  }

  const getTimeStats = (templateId: string): TimeStats => {
    const templateAnalytics = analytics[templateId];
    if (!templateAnalytics?.timeStats) {
      return {
        hourly: [],
        daily: [],
        weekly: [],
        monthly: [],
      };
    }

    const { timeStats } = templateAnalytics;
    return {
      hourly: Object.entries(timeStats.hourly || {}).map(([hour, value]) => ({
        time: `${hour}:00`,
        value: Number(value),
      })),
      daily: Object.entries(timeStats.daily || {}).map(([date, value]) => ({
        date,
        value: Number(value),
      })),
      weekly: Object.entries(timeStats.weekly || {}).map(([week, value]) => ({
        week,
        value: Number(value),
      })),
      monthly: Object.entries(timeStats.monthly || {}).map(([month, value]) => ({
        month,
        value: Number(value),
      })),
    };
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    updateAnalytics,
    getTopTemplates,
    getCategoryPerformance,
    getTimeStats,
  };
}; 