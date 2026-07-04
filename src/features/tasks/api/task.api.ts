import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  TasksDto,
  TaskVersionDto,
  AnnotationDto,
  PagedApiResponse,
  CreateTaskDto,
  SubmitTaskDto,
  RequestExtensionDto,
  RejectTaskDto,
  CreateDisputeDto,
} from '../../../api/generated/types';
import type { SubmitTaskWithFile } from '../types/task.types';

export type {
  CreateTaskDto,
  SubmitTaskDto,
  RequestExtensionDto,
  RejectTaskDto,
  CreateDisputeDto,
  TasksDto,
};

export const taskApi = {
  getMyTasks: async (params?: { page?: number; pageSize?: number; status?: string }) =>
    axiosInstance.get<PagedApiResponse<TasksDto>>('/api/tasks/mangaka-list', { params }),

  getAvailableTasks: async (params?: { page?: number; pageSize?: number; skill?: string }) =>
    axiosInstance.get('/api/tasks/available', {
      params: {
        pageNumber: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
        ...(params?.skill ? { skill: params.skill } : {}),
      },
    }),

  getAssistantMyTasks: async (params?: { page?: number; pageSize?: number }) =>
    axiosInstance.get('/api/tasks/my-tasks', {
      params: {
        pageNumber: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    }),

  getById: async (taskId: string) =>
    axiosInstance.get<ApiResponse<TasksDto>>(`/api/tasks/${taskId}`),

  create: async (data: CreateTaskDto) =>
    axiosInstance.post<ApiResponse<TasksDto>>('/api/tasks', data),

  accept: async (taskId: string) =>
    axiosInstance.post<ApiResponse<TasksDto>>(`/api/tasks/${taskId}/accept`),

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post<ApiResponse<string>>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  downloadResource: (taskId: string) =>
    axiosInstance.get(`/api/tasks/${taskId}/resource`, { responseType: 'blob' }),

  submitResult: async (taskId: string, data: SubmitTaskWithFile) => {
    const fileUrl = await taskApi.uploadFile(data.image);
    if (!fileUrl) {
      throw new Error('Upload file thất bại');
    }
    const payload: SubmitTaskDto = { submittedFileUrl: fileUrl };
    return axiosInstance.post<ApiResponse<unknown>>(`/api/tasks/${taskId}/submit`, payload);
  },

  approve: async (taskId: string) =>
    axiosInstance.post<ApiResponse<unknown>>(`/api/tasks/${taskId}/approve`, {}),

  requestRevision: async (taskId: string, payload: RejectTaskDto) =>
    axiosInstance.post<ApiResponse<unknown>>(`/api/tasks/${taskId}/reject`, payload),

  reportDispute: async (taskId: string, payload: CreateDisputeDto) =>
    axiosInstance.post<ApiResponse<unknown>>(`/api/tasks/${taskId}/dispute`, payload),

  requestExtension: async (taskId: string, payload: RequestExtensionDto) =>
    axiosInstance.post<ApiResponse<unknown>>(`/api/tasks/${taskId}/request-extension`, payload),

  approveExtension: async (taskId: string, approve: boolean) =>
    axiosInstance.post<ApiResponse<unknown>>(
      `/api/tasks/${taskId}/extension-approval?approve=${approve}`,
    ),

  cancel: (taskId: string, reason?: string) =>
    axiosInstance.post<ApiResponse<TasksDto>>(`/api/tasks/${taskId}/emergency-cancel`, { reason }),

  getVersions: (taskId: string) =>
    axiosInstance.get<ApiResponse<TaskVersionDto[]>>(`/api/tasks/${taskId}/versions`),

  getAnnotationsByTaskVersion: (taskVersionId: string) =>
    axiosInstance.get<ApiResponse<AnnotationDto[]>>('/api/annotations', {
      params: { taskVersionId },
    }),

  getCompositePage: (pageId: string) =>
    axiosInstance.get<Blob>(`/api/tasks/pages/${pageId}/composite`, {
      responseType: 'blob',
    }),

  refreshCompositePage: (pageId: string) =>
    axiosInstance.post<ApiResponse<string>>(`/api/tasks/pages/${pageId}/refresh-composite`),
};
