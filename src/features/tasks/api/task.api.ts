import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, PaginatedResponse, Task, TaskVersion } from '../../../types/entities';
import { MOCK_TASKS } from '../data/mockData';

import { components } from '../../../api/generated/schema';
import type { TaskStatus } from '../../../types/entities';

// ─── Toggle this to false when backend Tasks API is ready ────
const USE_MOCK_ALL = false;

// ─── Mapper ──────────────────────────────────────────────────
const mapTaskStatus = (status: any): TaskStatus => {
  if (status === 0 || status === '0') return 'Pending';
  if (status === 1 || status === '1') return 'In_Progress';
  if (status === 2 || status === '2') return 'Pending_Review';
  if (status === 3 || status === '3') return 'Approved';
  if (status === 4 || status === '4') return 'Revision';
  if (status === 5 || status === '5') return 'Disputed';
  if (status === 6 || status === '6') return 'Cancelled';
  if (status === 7 || status === '7') return 'Closed';
  return (status as TaskStatus) || 'Pending';
};

export const mapTaskDtoToEntity = (dto: components['schemas']['TasksDto']): Task => ({
  id: dto.Id?.toString() || '',
  regionId: dto.RegionId?.toString() || '',
  pageId: dto.PageNumber?.toString() || '', // Or map if available
  chapterId: '', // Fallback
  seriesId: dto.MangakaId?.toString() || '', // Fallback
  mangakaId: dto.MangakaId?.toString() || '',
  assignedAssistantId: dto.AssistantId?.toString() || '',
  assignedAssistantName: dto.AssistantName || '',
  status: mapTaskStatus(dto.Status),
  amount: dto.PaymentAmount || 0,
  deadline: dto.Deadline || new Date().toISOString(),
  extensionUsed: !!dto.ExtensionRequestDays,
  onLeave: false, // fallback
  createdAt: dto.CreateAt || new Date().toISOString(),
  updatedAt: dto.UpdateAt || new Date().toISOString(),
});

// ─── Request DTOs ────────────────────────────────────────────
export type CreateTaskRequest = components['schemas']['CreateTaskDto'];
export type ApproveTaskRequest = components['schemas']['ApproveTaskDto'];
export type RejectTaskRequest = components['schemas']['RejectTaskDto'];

export interface SubmitTaskResultRequest {
  taskId: string;
  image: File;
  comment?: string;
}

export interface RequestExtensionRequest {
  taskId: string;
  extensionHours: 24 | 48;
}

// ─── Mock helpers ────────────────────────────────────────────
const mockDelay = (ms: number = 50) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createMockAxiosResponse = <T>(data: T, message = 'Success') => ({
  data: {
    success: true,
    message: message,
    data: data,
  },
});

const createMockPaginatedResponse = <T>(
  items: T[],
  page = 1,
  pageSize = 20,
) => {
  const start = (page - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);
  return {
    data: {
      success: true,
      message: 'Success',
      data: paginatedItems,
      totalCount: items.length,
      pageNumber: page,
      pageSize: pageSize,
      totalPages: Math.ceil(items.length / pageSize),
    },
  };
};

// ─── API Functions ───────────────────────────────────────────

export const taskApi = {
  // Task listing
  getMyTasks: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    if (USE_MOCK_ALL) {
      await mockDelay(300);
      let filtered: any[] = [...MOCK_TASKS];
      if (params?.status) {
        filtered = filtered.filter((t) => t.status === params.status);
      }
      return createMockPaginatedResponse(filtered, params?.page, params?.pageSize);
    }
    return axiosInstance.get<ApiResponse<components['schemas']['TasksDtoPagedResult']>>('/api/tasks/mangaka-list', { params });
  },

  getAvailableTasks: async (params?: { page?: number; pageSize?: number; skill?: string }) => {
    if (USE_MOCK_ALL) {
      await mockDelay(300);
      let filtered = MOCK_TASKS.filter((t) => t.status === 'Pending');
      if (params?.skill) {
        filtered = filtered.filter((t) => t.taskName.toLowerCase().includes(params.skill!.toLowerCase()));
      }
      const mappedDtos = filtered.map(t => ({
        Id: t.id,
        Description: t.taskName,
        PaymentAmount: t.amount,
        Status: t.status,
        Deadline: t.deadline,
        MangakaName: t.seriesTitle,
        PageNumber: parseInt(t.pageName.replace(/[^0-9]/g, '') || '1'),
        PageImageUrl: null,
      }));
      return createMockPaginatedResponse(mappedDtos, params?.page, params?.pageSize);
    }
    return axiosInstance.get<ApiResponse<components['schemas']['TasksDtoPagedResult']>>('/api/tasks/available', {
      params: {
        PageNumber: params?.page ?? 1,
        PageSize: params?.pageSize ?? 10,
        ...(params?.skill ? { Skill: params.skill } : {}),
      },
    });
  },

  // Assistant's own tasks - FALLBACK TO MOCK since endpoint missing
  getAssistantMyTasks: async (params?: { page?: number; pageSize?: number }) => {
    await mockDelay(300);
    let filtered = MOCK_TASKS.filter((t) => 
      ['In_Progress', 'Pending_Review', 'Approved', 'Disputed', 'Revision'].includes(t.status) &&
      (t.assignedAssistantName === 'Nguyễn Sơn' || t.assignedAssistantName === 'Minh Anh')
    );
    const mappedDtos = filtered.map(t => ({
      Id: t.id,
      Description: t.taskName,
      PaymentAmount: t.amount,
      Status: t.status,
      Deadline: t.deadline,
      MangakaName: t.seriesTitle,
      PageNumber: parseInt(t.pageName.replace(/[^0-9]/g, '') || '1'),
      PageImageUrl: null,
      FeedbackComment: t.feedbackComment || null,
    }));
    return createMockPaginatedResponse(mappedDtos, params?.page, params?.pageSize);
  },

  getById: async (taskId: string) => {
    if (USE_MOCK_ALL) {
      await mockDelay(200);
      const task = MOCK_TASKS.find((t) => t.id === taskId);
      if (!task) {
        return { data: { IsSuccess: false, Message: 'Task not found', Data: null } };
      }
      return createMockAxiosResponse(task);
    }
    // Missing endpoint in schema, fallback to MOCK
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    return createMockAxiosResponse(task);
  },

  // Mangaka creates task (F2.3) — triggers Lock (T01)
  create: async (data: CreateTaskRequest) => {
    if (USE_MOCK_ALL) {
      // Mock logic omitted for brevity in integration
      return createMockAxiosResponse({} as any);
    }
    return axiosInstance.post<ApiResponse<components['schemas']['TasksDto']>>('/api/tasks', data);
  },

  // Assistant accepts task (F2.6) - KEEP MOCK for now
  accept: async (taskId: string) => {
    await mockDelay(400);
    const task = MOCK_TASKS.find((t) => t.id === taskId || t.id === `task-${taskId}`);
    if (task) {
      task.status = 'In_Progress';
      task.assignedAssistantName = 'Nguyễn Sơn';
    }
    return createMockAxiosResponse(task as unknown as Task, 'Nhận việc thành công');
  },

  // Assistant downloads resource (F2.7)
  downloadResource: (taskId: string) =>
    axiosInstance.get(`/api/tasks/${taskId}/resource`, { responseType: 'blob' }),

  // Assistant submits result (F2.8) - KEEP MOCK for now
  submitResult: async (taskId: string, data: SubmitTaskResultRequest) => {
    await mockDelay(600);
    const task = MOCK_TASKS.find((t) => t.id === taskId || t.id === `task-${taskId}`);
    if (task) {
      task.status = 'Pending_Review';
      if (data.image) {
        task.resultImageUrl = URL.createObjectURL(data.image);
      }
    }
    return createMockAxiosResponse({ taskId } as unknown as TaskVersion, 'Nộp bài thành công');
  },

  // Mangaka reviews (F1.10)
  approve: async (taskId: string, data?: ApproveTaskRequest) => {
    if (USE_MOCK_ALL) {
      return createMockAxiosResponse({} as any);
    }
    return axiosInstance.post<ApiResponse<null>>(`/api/tasks/${taskId}/approve`, data || {});
  },

  requestRevision: async (taskId: string, data: RejectTaskRequest) => {
    if (USE_MOCK_ALL) {
      return createMockAxiosResponse({} as any);
    }
    return axiosInstance.post<ApiResponse<null>>(`/api/tasks/${taskId}/reject`, data);
  },

  // Extension (T08)
  requestExtension: (taskId: string, data: RequestExtensionRequest) =>
    axiosInstance.post<ApiResponse<null>>(`/api/tasks/${taskId}/extension-approval`, data),

  // Cancel (T03b, T05)
  cancel: (taskId: string, reason?: string) =>
    axiosInstance.post<ApiResponse<null>>(`/api/tasks/${taskId}/emergency-cancel`, { reason }),

  // On_Leave toggle (F2.14)
  toggleOnLeave: (onLeave: boolean) =>
    axiosInstance.put<ApiResponse<null>>('/api/tasks/on-leave', { onLeave }),

  // Task versions (T07)
  getVersions: (taskId: string) =>
    axiosInstance.get<ApiResponse<TaskVersion[]>>(`/api/tasks/${taskId}/versions`),
};
