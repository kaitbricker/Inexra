import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  userGrowth: number;
  activeUserGrowth: number;
  timeSeriesData: Array<{
    name: string;
    value: number;
  }>;
}

export function useAnalytics() {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await api.get('/api/analytics');
      return response.data;
    },
  });

  return {
    data,
    loading: isLoading,
    error,
  };
} 