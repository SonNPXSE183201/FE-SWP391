import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import type { AssistantRecentTaskDto } from '../api/dashboard.api';

// ─── Hook return types ───────────────────────────────────────

export interface AssistantDashboardStats {
  inProgress: number;
  completed: number;
  averageRating: number;
  monthlyIncome: number;
}

export interface AssistantRecentTask {
  id: string;
  title: string;
  status: string;
  amount: number;
  date: string;
}

// ─── Hook ────────────────────────────────────────────────────
export const useAssistantDashboard = () => {
  const query = useQuery<
    { stats: AssistantDashboardStats; recentTasks: AssistantRecentTask[] },
    Error
  >({
    queryKey: ['dashboard', 'assistant'],
    queryFn: async () => {
      const response = await dashboardApi.getAssistantDashboard();

      const apiResponse = response.data;
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || 'Failed to fetch assistant dashboard');
      }

      const data = apiResponse.data;

      const stats: AssistantDashboardStats = { ...data.stats };

      const recentTasks: AssistantRecentTask[] = data.recentTasks.map(
        (task: AssistantRecentTaskDto) => ({ ...task })
      );

      return { stats, recentTasks };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    stats: query.data?.stats ?? null,
    recentTasks: query.data?.recentTasks ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
