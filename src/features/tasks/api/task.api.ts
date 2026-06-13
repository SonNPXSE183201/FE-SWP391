import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, PaginatedResponse, Task, TaskVersion } from '../../../types';
import { MOCK_TASKS } from '../data/mockData';
import type { MockTask } from '../data/mockData';

// ─── Toggle this to false when backend Tasks API is ready ────
const USE_MOCK = true;

// ─── Request DTOs ────────────────────────────────────────────

export interface CreateTaskRequest {
  regionId: string;
  assignedAssistantId: string;
  amount: number;
  deadline: string;
}

export interface SubmitTaskResultRequest {
  taskId: string;
  image: File;
  comment?: string;
}

export interface RequestExtensionRequest {
  taskId: string;
  extensionHours: 24 | 48;   // T08: only +24h or +48h
}

// ─── Mock helpers ────────────────────────────────────────────
const mockDelay = (ms: number = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createMockAxiosResponse = <T>(data: T, message = 'Success') => ({
  data: {
    IsSuccess: true,
    Message: message,
    Data: data,
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
      IsSuccess: true,
      Message: 'Success',
      Data: paginatedItems,
      TotalCount: items.length,
      PageNumber: page,
      PageSize: pageSize,
      TotalPages: Math.ceil(items.length / pageSize),
    },
  };
};

// ─── API Functions ───────────────────────────────────────────

export const taskApi = {
  // Task listing
  getMyTasks: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    if (USE_MOCK) {
      await mockDelay(300);
      let filtered: MockTask[] = [...MOCK_TASKS];
      if (params?.status) {
        filtered = filtered.filter((t) => t.status === params.status);
      }
      return createMockPaginatedResponse(filtered, params?.page, params?.pageSize);
    }
    return axiosInstance.get<PaginatedResponse<Task>>('/api/tasks/my', { params });
  },

  getAvailableTasks: async (params?: { page?: number; pageSize?: number }) => {
    if (USE_MOCK) {
      await mockDelay(300);
      const available = MOCK_TASKS.filter((t) => !t.assignedAssistantName && t.status === 'Pending');
      return createMockPaginatedResponse(available, params?.page, params?.pageSize);
    }
    return axiosInstance.get<PaginatedResponse<Task>>('/api/tasks/available', { params });
  },

  getById: async (taskId: string) => {
    if (USE_MOCK) {
      await mockDelay(200);
      const task = MOCK_TASKS.find((t) => t.id === taskId);
      if (!task) {
        return { data: { IsSuccess: false, Message: 'Task not found', Data: null } };
      }
      return createMockAxiosResponse(task);
    }
    return axiosInstance.get<ApiResponse<Task>>(`/api/tasks/${taskId}`);
  },

  // Mangaka creates task (F2.3) — triggers Lock (T01)
  create: (data: CreateTaskRequest) =>
    axiosInstance.post<ApiResponse<Task>>('/api/tasks', data),

  // Assistant accepts task (F2.6)
  accept: (taskId: string) =>
    axiosInstance.put<ApiResponse<Task>>(`/api/tasks/${taskId}/accept`),

  // Assistant downloads resource (F2.7)
  downloadResource: (taskId: string) =>
    axiosInstance.get(`/api/tasks/${taskId}/resource`, { responseType: 'blob' }),

  // Assistant submits result (F2.8)
  submitResult: (taskId: string, data: SubmitTaskResultRequest) => {
    const formData = new FormData();
    formData.append('image', data.image);
    if (data.comment) formData.append('comment', data.comment);
    return axiosInstance.post<ApiResponse<TaskVersion>>(`/api/tasks/${taskId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Mangaka reviews (F1.10)
  approve: (taskId: string) =>
    axiosInstance.put<ApiResponse<Task>>(`/api/tasks/${taskId}/approve`),

  requestRevision: (taskId: string, comment: string, extensionHours: 24 | 48) =>
    axiosInstance.put<ApiResponse<Task>>(`/api/tasks/${taskId}/revision`, { comment, extensionHours }),

  // Extension (T08)
  requestExtension: (data: RequestExtensionRequest) =>
    axiosInstance.put<ApiResponse<Task>>(`/api/tasks/${data.taskId}/extend`, data),

  // Cancel (T03b, T05)
  cancel: (taskId: string, reason?: string) =>
    axiosInstance.put<ApiResponse<Task>>(`/api/tasks/${taskId}/cancel`, { reason }),

  // On_Leave toggle (F2.14)
  toggleOnLeave: (onLeave: boolean) =>
    axiosInstance.put<ApiResponse<null>>('/api/tasks/on-leave', { onLeave }),

  // Task versions (T07)
  getVersions: (taskId: string) =>
    axiosInstance.get<ApiResponse<TaskVersion[]>>(`/api/tasks/${taskId}/versions`),
};
