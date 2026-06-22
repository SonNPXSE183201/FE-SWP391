import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const useAdminDashboard = () => {
  const query = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: async () => {
      const response = await dashboardApi.getAdminDashboard();
      const apiResponse = response.data;
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || 'Failed to fetch admin dashboard');
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
