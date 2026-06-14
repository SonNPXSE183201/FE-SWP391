import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import type { MockTask } from '../data/mockData';

// ─── Mangaka Tasks ───────────────────────────────────────────
export const useMangakaTasks = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery<MockTask[], Error>({
    queryKey: ['tasks', 'mangaka', params],
    queryFn: async () => {
      const res = await taskApi.getMyTasks(params);
      const apiData = res.data as any;
      return apiData.Data ?? apiData.data ?? [];
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

// ─── Available Tasks (for Assistant Queue) ───────────────────
export const useAvailableTasks = (params?: { page?: number; pageSize?: number }) => {
  return useQuery<MockTask[], Error>({
    queryKey: ['tasks', 'available', params],
    queryFn: async () => {
      const res = await taskApi.getAvailableTasks(params);
      const apiData = res.data as any;
      return apiData.Data ?? apiData.data ?? [];
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

// ─── Task Detail ─────────────────────────────────────────────
export const useTaskDetail = (taskId?: string) => {
  return useQuery<MockTask | null, Error>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await taskApi.getById(taskId as string);
      const apiData = res.data as any;
      if (!apiData.IsSuccess) return null;
      return apiData.Data ?? null;
    },
    enabled: !!taskId,
    retry: 1,
  });
};
