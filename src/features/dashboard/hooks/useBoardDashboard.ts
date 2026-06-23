import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const useBoardDashboard = () => {
  const query = useQuery({
    queryKey: ['dashboard', 'board'],
    queryFn: async () => {
      const response = await dashboardApi.getBoardDashboard();
      const apiResponse = response.data;
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || 'Failed to fetch board dashboard');
      }
      return apiResponse.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    stats: query.data?.stats ?? null,
    recentActivities: query.data?.recentActivities ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
