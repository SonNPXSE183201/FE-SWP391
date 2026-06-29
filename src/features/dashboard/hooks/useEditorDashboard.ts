import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const useEditorDashboard = () => {
  const query = useQuery({
    queryKey: ['dashboard', 'editor'],
    queryFn: () => dashboardApi.getEditorDashboard(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    stats: query.data?.stats ?? null,
    recentActivities: query.data?.recentActivities ?? [],
    charts: query.data?.charts ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};
