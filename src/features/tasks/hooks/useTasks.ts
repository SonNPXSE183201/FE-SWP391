import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import type { MockTask } from '../data/mockData';
import type { TaskStatus } from '../../../types/entities';

// ─── Backend TasksDto (from GET /api/tasks/available) ────────
export interface AvailableTaskDto {
  Id: number;
  MangakaId: number;
  RegionId: number;
  AssistantId: number | null;
  Description: string | null;
  PaymentAmount: number;
  Deadline: string;
  ExtensionRequestDays: number | null;
  ExtensionReason: string | null;
  ExtensionStatus: string | null;
  ZIndex_Order: number;
  Status: TaskStatus;
  Rating: number | null;
  FeedbackComment: string | null;
  MangakaName: string | null;
  AssistantName: string | null;
  PageNumber: number;
  PageImageUrl: string | null;
  CreateAt: string;
  UpdateAt: string | null;
}

export interface AvailableTasksResult {
  items: AvailableTaskDto[];
  totalPages: number;
  totalItems: number;
  pageNumber: number;
}

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
export const useAvailableTasks = (params?: { page?: number; pageSize?: number; skill?: string }) => {
  return useQuery<AvailableTasksResult, Error>({
    queryKey: ['tasks', 'available', params],
    queryFn: async () => {
      const res = await taskApi.getAvailableTasks(params);
      const apiData = (res.data as any)?.Data ?? (res.data as any)?.data;
      // Handle PagedResult: { Items, PageNumber, PageSize, TotalItems, TotalPages }
      const items: AvailableTaskDto[] = apiData?.Items ?? apiData?.items ?? (Array.isArray(apiData) ? apiData : []);
      const totalPages = apiData?.TotalPages ?? apiData?.totalPages ?? 1;
      const totalItems = apiData?.TotalItems ?? apiData?.totalItems ?? items.length;
      const pageNumber = apiData?.PageNumber ?? apiData?.pageNumber ?? 1;
      return { items, totalPages, totalItems, pageNumber };
    },
    staleTime: 1000 * 30, // 30s — available tasks change frequently
    retry: 1,
  });
};

// ─── Accept Task (Assistant nhận việc) ───────────────────────
export const useAcceptTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => taskApi.accept(String(taskId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'available'] });
    },
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
