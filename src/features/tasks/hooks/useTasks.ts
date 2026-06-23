import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import type { ApiResponse, TasksDto } from '../../../api/generated/types';
import type { Task, TaskStatus } from '../../../types/entities';
import { unwrapPaged } from '../../../api/apiResponse';

export type AvailableTaskDto = TasksDto;

export interface AvailableTasksResult {
  items: AvailableTaskDto[];
  totalPages: number;
  totalItems: number;
  pageNumber: number;
}

export const mapTaskDtoToEntity = (dto: TasksDto): Task => {
  return {
    id: String(dto.id || ''),
    createdAt: dto.createAt || new Date().toISOString(),
    updatedAt: dto.updateAt || dto.createAt || new Date().toISOString(),
    regionId: String(dto.regionId || ''),
    pageId: '',
    chapterId: '',
    seriesId: '',
    mangakaId: String(dto.mangakaId || ''),
    assignedAssistantId: dto.assistantId ? String(dto.assistantId) : undefined,
    assignedAssistantName: dto.assistantName || undefined,
    description: dto.description || undefined,
    status: (dto.status as TaskStatus) || 'Pending',
    amount: dto.paymentAmount || 0,
    deadline: dto.deadline || '',
    extensionUsed: !!dto.extensionRequestDays,
    extensionReason: dto.extensionReason || undefined,
    extensionStatus: dto.extensionStatus || undefined,
    extensionRequestDays: dto.extensionRequestDays || undefined,
    onLeave: false,
  };
};

// ─── Mangaka Tasks ───────────────────────────────────────────
export const useMangakaTasks = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery<TasksDto[], Error>({
    queryKey: ['tasks', 'mangaka', params],
    queryFn: async () => {
      const res = await taskApi.getMyTasks(params);
      const payload = res.data as ApiResponse<unknown>;
      return unwrapPaged<TasksDto>(payload).items;
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
      const payload = res.data as ApiResponse<unknown>;
      return unwrapPaged<TasksDto>(payload);
    },
    staleTime: 1000 * 30,
    retry: 1,
  });
};

export const useAssistantMyTasks = (params?: { page?: number; pageSize?: number }) => {
  return useQuery<AvailableTasksResult, Error>({
    queryKey: ['tasks', 'assistant-my', params],
    queryFn: async () => {
      const res = await taskApi.getAssistantMyTasks(params);
      const payload = res.data as ApiResponse<unknown>;
      return unwrapPaged<TasksDto>(payload);
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
        feedbackComment: comment,
        revisionExtensionHours: extensionHours,
        coordinatesJson: '[]',
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
    mutationFn: ({ taskId, days, reason }: { taskId: string; days: 1 | 2; reason: string }) =>
      taskApi.requestExtension({ taskId, days, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assistant-my'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mangaka'] });
    },
  });
};

export const useApproveExtension = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, approve }: { taskId: string; approve: boolean }) =>
      taskApi.approveExtension(taskId, approve),
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
      const payload = res.data as ApiResponse<TasksDto>;
      if (!payload.success) return null;
      const data = payload.data;
      if (!data) return null;
      return mapTaskDtoToEntity(data);
    },
    enabled: !!taskId,
    retry: 1,
  });
};
