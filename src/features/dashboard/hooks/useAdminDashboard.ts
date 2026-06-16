import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type AdminDashboardStatsDto, type AdminRecentActivityDto } from '../api/dashboard.api';

export const useAdminDashboard = () => {
  const query = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const response = await dashboardApi.getAdminDashboard();
      const apiResponse = response.data;
      if (!apiResponse.IsSuccess || !apiResponse.Data) {
        throw new Error(apiResponse.Message || 'Failed to fetch admin dashboard');
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
