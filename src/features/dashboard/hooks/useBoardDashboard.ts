import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type BoardDashboardStatsDto, type BoardRecentActivityDto } from '../api/dashboard.api';

export const useBoardDashboard = () => {
  const query = useQuery({
    queryKey: ['dashboard', 'board'],
    queryFn: async () => {
      const response = await dashboardApi.getBoardDashboard();
      const apiResponse = response.data;
      if (!apiResponse.IsSuccess || !apiResponse.Data) {
        throw new Error(apiResponse.Message || 'Failed to fetch board dashboard');
      }
      return apiResponse.Data;
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
