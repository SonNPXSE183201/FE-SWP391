import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type EditorDashboardStatsDto, type EditorRecentActivityDto } from '../api/dashboard.api';

export const useEditorDashboard = () => {
  const query = useQuery({
    queryKey: ['dashboard', 'editor'],
    queryFn: async () => {
      const response = await dashboardApi.getEditorDashboard();
      const apiResponse = response.data;
      if (!apiResponse.IsSuccess || !apiResponse.Data) {
        throw new Error(apiResponse.Message || 'Failed to fetch editor dashboard');
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
