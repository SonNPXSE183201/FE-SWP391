import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import type { Task, TaskStatus } from '../../../types/entities';
import { components } from '../../../api/generated/schema';

export type AvailableTaskDto = components['schemas']['TasksDto'];

export interface AvailableTasksResult {
  items: AvailableTaskDto[];
  totalPages: number;
  totalItems: number;
  pageNumber: number;
}

type ApiEnvelope = {
  Data?: unknown;
  data?: unknown;
  IsSuccess?: boolean;
};

const getPagedTaskItems = (body: unknown): AvailableTasksResult => {
  const envelope = body as ApiEnvelope;
  const raw = (envelope.Data ?? envelope.data) as Record<string, unknown> | unknown[] | undefined;
  const items = (
    Array.isArray(raw)
      ? raw
      : (raw as Record<string, unknown> | undefined)?.Items
        ?? (raw as Record<string, unknown> | undefined)?.items
        ?? []
  ) as AvailableTaskDto[];
  const pageSource = Array.isArray(raw) ? undefined : (raw as Record<string, unknown> | undefined);
  return {
    items,
    totalPages: Number(pageSource?.TotalPages ?? pageSource?.totalPages ?? 1),
    totalItems: Number(pageSource?.TotalItems ?? pageSource?.totalItems ?? items.length),
    pageNumber: Number(pageSource?.PageNumber ?? pageSource?.pageNumber ?? 1),
  };
};

export const mapTaskDtoToEntity = (dto: components['schemas']['TasksDto']): Task => {
  return {
    id: String(dto.Id || ''),
    createdAt: new Date().toISOString(), // Mock fallback if missing
    updatedAt: new Date().toISOString(),
    regionId: String(dto.RegionId || ''),
    pageId: dto.PageNumber ? String(dto.PageNumber) : '',
    chapterId: '', // Mock fallback
    seriesId: '', // Mock fallback
    mangakaId: String(dto.MangakaId || ''),
    assignedAssistantId: dto.AssistantId ? String(dto.AssistantId) : undefined,
    assignedAssistantName: dto.AssistantName || undefined,
    status: (dto.Status as TaskStatus | undefined) ?? 'Pending',
    amount: dto.PaymentAmount || 0,
    deadline: dto.Deadline || '',
    extensionUsed: !!dto.ExtensionRequestDays,
    onLeave: false,
    extensionReason: dto.ExtensionReason ?? undefined,
    extensionStatus: dto.ExtensionStatus ?? undefined,
    extensionRequestDays: dto.ExtensionRequestDays ?? undefined,
  };
};

// ─── Mangaka Tasks ───────────────────────────────────────────
export const useMangakaTasks = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery<Task[], Error>({
    queryKey: ['tasks', 'mangaka', params],
    queryFn: async () => {
      const res = await taskApi.getMyTasks(params);
      const envelope = res.data as ApiEnvelope;
      const rawData = (envelope.Data ?? envelope.data) as Record<string, unknown> | unknown[] | undefined;
      const items = (
        Array.isArray(rawData)
          ? rawData
          : rawData?.Items ?? rawData?.items ?? []
      ) as components['schemas']['TasksDto'][];
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
      return getPagedTaskItems(res.data);
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
      return getPagedTaskItems(res.data);
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
      const apiData = res.data as ApiEnvelope & { Data?: components['schemas']['TasksDto'] };
      if (!apiData.IsSuccess || !apiData.Data) return null;
      return mapTaskDtoToEntity(apiData.Data);
    },
    enabled: !!taskId,
    retry: 1,
  });
};
