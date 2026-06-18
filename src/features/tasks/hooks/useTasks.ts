import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import type { ApiResponse } from '../../../api/axios';
import type { TasksDto, TasksDtoPagedResult } from '../../../api/generated/types';
import type { Task, TaskStatus } from '../../../types/entities';

export type AvailableTaskDto = TasksDto;

const extractPagedTasks = (payload: ApiResponse<TasksDtoPagedResult | TasksDto[] | undefined>) => {
  const rawData = payload.Data;
  const paged = rawData && typeof rawData === 'object' && 'Items' in rawData ? rawData : null;
  const items: TasksDto[] = paged?.Items ?? (Array.isArray(rawData) ? rawData : []);
  return {
    items,
    totalPages: paged?.TotalPages ?? 1,
    totalItems: paged?.TotalItems ?? items.length,
    pageNumber: paged?.PageNumber ?? 1,
  };
};

export interface AvailableTasksResult {
  items: AvailableTaskDto[];
  totalPages: number;
  totalItems: number;
  pageNumber: number;
}

export const mapTaskDtoToEntity = (dto: TasksDto): Task => {
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
    status: (dto.Status as TaskStatus) || 'Pending',
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
      const payload = res.data as ApiResponse<TasksDtoPagedResult | TasksDto[]>;
      const items = extractPagedTasks(payload).items;
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
      const payload = res.data as ApiResponse<TasksDtoPagedResult | TasksDto[]>;
      return extractPagedTasks(payload);
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
      const payload = res.data as ApiResponse<TasksDtoPagedResult | TasksDto[]>;
      return extractPagedTasks(payload);
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
        CoordinatesJson: '[]',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mangaka'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assistant-my'] });
    },
  });
};

// ─── Request Extension (Assistant xin gia hạn) ─────────────────
export const useRequestExtension = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, extensionHours }: { taskId: string; extensionHours: 24 | 48 }) =>
      taskApi.requestExtension({ taskId, extensionHours }),
    onSuccess: () => {
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
      const payload = res.data as ApiResponse<TasksDto>;
      if (!payload.IsSuccess || !payload.Data) return null;
      return mapTaskDtoToEntity(payload.Data);
    },
    enabled: !!taskId,
    retry: 1,
  });
};
