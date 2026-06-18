import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import type { Task } from '../../../types/entities';
import { components } from '../../../api/generated/schema';

export type AvailableTaskDto = components['schemas']['TasksDto'];

export interface AvailableTasksResult {
  items: AvailableTaskDto[];
  totalPages: number;
  totalItems: number;
  pageNumber: number;
}

export const mapTaskDtoToEntity = (dto: components['schemas']['TasksDto']): Task => {
  return {
    id: String(dto.Id || ''),
    createdAt: new Date().toISOString(), // Mock fallback if missing
    updatedAt: new Date().toISOString(),
    regionId: String(dto.RegionId || ''),
    pageId: '', // Mock fallback
    chapterId: '', // Mock fallback
    seriesId: '', // Mock fallback
    mangakaId: String(dto.MangakaId || ''),
    assignedAssistantId: dto.AssistantId ? String(dto.AssistantId) : undefined,
    assignedAssistantName: dto.AssistantName || undefined,
    status: (dto.Status as any) || 'Pending',
    amount: dto.PaymentAmount || 0,
    deadline: dto.Deadline || '',
    extensionUsed: !!dto.ExtensionRequestDays,
    onLeave: false,
  };
};

// ─── Mangaka Tasks ───────────────────────────────────────────
export const useMangakaTasks = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery<Task[], Error>({
    queryKey: ['tasks', 'mangaka', params],
    queryFn: async () => {
      const res = await taskApi.getMyTasks(params);
      const apiData = res.data as any;
      const rawData = apiData.Data ?? apiData.data;
      const items: components['schemas']['TasksDto'][] = rawData?.Items ?? rawData?.items ?? (Array.isArray(rawData) ? rawData : []);
      return items.map(mapTaskDtoToEntity);
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

export const useAssistantMyTasks = (params?: { page?: number; pageSize?: number }) => {
  return useQuery<AvailableTasksResult, Error>({
    queryKey: ['tasks', 'assistant-my', params],
    queryFn: async () => {
      const res = await taskApi.getAssistantMyTasks(params);
      const apiData = (res.data as any)?.Data ?? (res.data as any)?.data;
      const items: AvailableTaskDto[] = apiData?.Items ?? apiData?.items ?? (Array.isArray(apiData) ? apiData : []);
      const totalPages = apiData?.TotalPages ?? apiData?.totalPages ?? 1;
      const totalItems = apiData?.TotalItems ?? apiData?.totalItems ?? items.length;
      const pageNumber = apiData?.PageNumber ?? apiData?.pageNumber ?? 1;
      return { items, totalPages, totalItems, pageNumber };
    },
    staleTime: 1000 * 30,
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
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assistant-my'] });
    },
  });
};

// ─── Approve Task (Mangaka duyệt bài) ──────────────────────────
export const useApproveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskApi.approve(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mangaka'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assistant-my'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};

// ─── Request Revision Task (Mangaka yêu cầu sửa bài) ───────────
export const useRequestRevisionTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, comment, extensionHours }: { taskId: string; comment: string; extensionHours: 24 | 48 }) =>
      taskApi.requestRevision(taskId, {
        FeedbackComment: comment,
        RevisionExtensionHours: extensionHours,
        CoordinatesJson: '',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mangaka'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assistant-my'] });
    },
  });
};

// ─── Task Detail ─────────────────────────────────────────────
export const useTaskDetail = (taskId?: string) => {
  return useQuery<Task | null, Error>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await taskApi.getById(taskId as string);
      const apiData = res.data as any;
      if (!apiData.IsSuccess || !apiData.Data) return null;
      return mapTaskDtoToEntity(apiData.Data);
    },
    enabled: !!taskId,
    retry: 1,
  });
};
