import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import type { ApiResponse, TasksDto, TaskVersionDto, AnnotationDto } from '../../../api/generated/types';
import { unwrapPaged } from '../../../api/apiResponse';
import { normalizeTaskStatus } from '../../../utils/status';

export type AvailableTaskDto = TasksDto;

export interface AvailableTasksResult {
  items: AvailableTaskDto[];
  totalPages: number;
  totalItems: number;
  pageNumber: number;
}

/**
 * Backend dùng "Submitted" cho trạng thái chờ tác giả duyệt;
 * chuẩn hóa về Pending_Review tại utils/status.
 */
export { normalizeTaskStatus } from '../../../utils/status';

/** Trả về bản sao DTO với status đã chuẩn hóa về union TaskStatus của frontend. */
export const normalizeTaskDto = (dto: TasksDto): TasksDto =>
  ({ ...dto, status: normalizeTaskStatus(dto.status) as TasksDto['status'] });

// ─── Mangaka Tasks ───────────────────────────────────────────
export const useMangakaTasks = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery<TasksDto[], Error>({
    queryKey: ['tasks', 'mangaka', params],
    queryFn: async () => {
      const res = await taskApi.getMyTasks(params);
      const payload = res.data as ApiResponse<unknown>;
      return unwrapPaged<TasksDto>(payload).items.map(normalizeTaskDto);
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
      const result = unwrapPaged<TasksDto>(payload);
      return { ...result, items: result.items.map(normalizeTaskDto) };
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

export const useAssistantMyTasks = (params?: { page?: number; pageSize?: number }) => {
  return useQuery<AvailableTasksResult, Error>({
    queryKey: ['tasks', 'assistant-my', params],
    queryFn: async () => {
      const res = await taskApi.getAssistantMyTasks(params);
      const payload = res.data as ApiResponse<unknown>;
      const result = unwrapPaged<TasksDto>(payload);
      return { ...result, items: result.items.map(normalizeTaskDto) };
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
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

// ─── Composited page image (sau khi duyệt Task) ─────────────
export const useCompositedPageUrl = (pageId?: string) => {
  const query = useQuery<string | null, Error>({
    queryKey: ['canvas', 'composite', pageId],
    queryFn: async () => {
      try {
        const res = await taskApi.getCompositePage(pageId as string);
        return URL.createObjectURL(res.data);
      } catch {
        return null;
      }
    },
    enabled: !!pageId,
    staleTime: 0,
    retry: false,
  });

  // Giải phóng blob URL khi unmount / đổi trang
  useEffect(() => {
    const url = query.data;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [query.data]);

  return query;
};

// ─── Làm mới ảnh gộp trang (sau khi sửa Region / duyệt Task) ─
export const useRefreshPageComposite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => taskApi.refreshCompositePage(pageId),
    onSuccess: (_res, pageId) => {
      queryClient.invalidateQueries({ queryKey: ['canvas', 'composite', pageId] });
      queryClient.invalidateQueries({ queryKey: ['canvas', 'pages'] });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
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
      queryClient.invalidateQueries({ queryKey: ['canvas'] });
      queryClient.invalidateQueries({ queryKey: ['canvas', 'composite'] });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      // Trang bản thảo (ChapterDetailFeature) dùng key ['pages', chapterId] —
      // phải invalidate để ảnh composite mới hiện ngay sau khi duyệt.
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
};

// ─── Request Revision Task (Mangaka yêu cầu sửa bài) ───────────
export const useRequestRevisionTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, comment, extensionHours, coordinatesJson }: {
      taskId: string;
      comment: string;
      extensionHours: 24 | 48;
      coordinatesJson?: string;
    }) =>
      taskApi.requestRevision(taskId, {
        feedbackComment: comment,
        revisionExtensionHours: extensionHours,
        coordinatesJson: coordinatesJson ?? '[]',
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mangaka'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assistant-my'] });
      queryClient.invalidateQueries({ queryKey: ['task', vars.taskId, 'versions'] });
    },
  });
};

// ─── Report Dispute Task (Mangaka báo cáo tranh chấp) ─────────
export const useReportDisputeTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) =>
      taskApi.reportDispute(taskId, { reason }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mangaka'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assistant-my'] });
      queryClient.invalidateQueries({ queryKey: ['task', vars.taskId, 'versions'] });
    },
  });
};

// ─── Request Extension (Assistant xin gia hạn) ─────────────────
export const useRequestExtension = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, days, reason }: { taskId: string; days: 1 | 2; reason: string }) =>
      taskApi.requestExtension(taskId, { days, reason }),
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

// ─── Task Version Annotations (điểm ghim khi Mangaka yêu cầu sửa) ───
export const useTaskVersionAnnotations = (taskVersionId?: string) => {
  return useQuery<AnnotationDto[], Error>({
    queryKey: ['task-version', taskVersionId, 'annotations'],
    queryFn: async () => {
      const res = await taskApi.getAnnotationsByTaskVersion(taskVersionId as string);
      const payload = res.data as ApiResponse<AnnotationDto[]>;
      if (!payload.success || !payload.data) return [];
      return payload.data;
    },
    enabled: !!taskVersionId,
    retry: 1,
  });
};

// ─── Task Detail ─────────────────────────────────────────────
export const useTaskDetail = (taskId?: string) => {
  return useQuery<TasksDto | null, Error>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await taskApi.getById(taskId as string);
      const payload = res.data as ApiResponse<TasksDto>;
      if (!payload.success) return null;
      const data = payload.data;
      if (!data) return null;
      return normalizeTaskDto(data);
    },
    enabled: !!taskId,
    retry: 1,
  });
};

// ─── Task Versions (T07 — lịch sử bài nộp của Assistant) ──────
export const useTaskVersions = (taskId?: string) => {
  return useQuery<TaskVersionDto[], Error>({
    queryKey: ['task', taskId, 'versions'],
    queryFn: async () => {
      const res = await taskApi.getVersions(taskId as string);
      const payload = res.data as ApiResponse<TaskVersionDto[]>;
      if (!payload.success || !payload.data) return [];
      // Mới nhất lên đầu
      return [...payload.data].sort(
        (a, b) => (b.versionNumber ?? 0) - (a.versionNumber ?? 0),
      );
    },
    enabled: !!taskId,
    retry: 1,
  });
};
