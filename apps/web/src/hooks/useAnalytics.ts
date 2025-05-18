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

const defaultData: AnalyticsData = {
  totalUsers: 0,
  activeUsers: 0,
  userGrowth: 0,
  activeUserGrowth: 0,
  timeSeriesData: []
};

export function useAnalytics() {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await api.get('/api/analytics');
      return response.data;
    },
    // Disable the query during SSR
    enabled: typeof window !== 'undefined',
    // Provide default data during SSR
    initialData: defaultData
  });

  return {
    data,
    loading: isLoading,
    error,
  };
} 