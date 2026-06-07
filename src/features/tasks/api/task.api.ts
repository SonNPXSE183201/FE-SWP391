import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, PaginatedResponse, Task, TaskVersion } from '../../../types';

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

// ─── API Functions ───────────────────────────────────────────

export const taskApi = {
  // Task listing
  getMyTasks: (params?: { page?: number; pageSize?: number; status?: string }) =>
    axiosInstance.get<PaginatedResponse<Task>>('/api/tasks/my', { params }),

  getAvailableTasks: (params?: { page?: number; pageSize?: number }) =>
    axiosInstance.get<PaginatedResponse<Task>>('/api/tasks/available', { params }),

  getById: (taskId: string) =>
    axiosInstance.get<ApiResponse<Task>>(`/api/tasks/${taskId}`),

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
