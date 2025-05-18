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
      // Only make the API call on the client side
      if (typeof window === 'undefined') {
        return {
          totalUsers: 0,
          activeUsers: 0,
          userGrowth: 0,
          activeUserGrowth: 0,
          timeSeriesData: []
        };
      }
      const response = await api.get('/api/analytics');
      return response.data;
    },
    // Disable the query during SSR
    enabled: typeof window !== 'undefined'
  });

  return {
    data,
    loading: isLoading,
    error,
  };
} 