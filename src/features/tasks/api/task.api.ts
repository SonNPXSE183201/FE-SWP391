import { axiosInstance, createMockApiResponse } from '../../../api/axios';
import type {
  ApiResponse,
  TasksDto,
  TaskVersionDto,
  AnnotationDto,
  PagedApiResponse,
} from '../../../api/generated/types';
import { MOCK_TASKS } from '../data/mockData';
import type { MockTask } from '../data/mockData';
import { MOCK_WALLET, MOCK_TRANSACTIONS } from '../../wallet/data/mockData';

// ─── Mock ──────────────────────────────────────────────────
const USE_MOCK = false;

import { components } from '../../../api/generated/schema';
import type { TaskStatus, Task } from '../../../types/entities';

// ─── Mapper ──────────────────────────────────────────────────
const mapTaskStatus = (status: unknown): TaskStatus => {
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
  id: dto.id?.toString() || '',
  regionId: dto.regionId?.toString() || '',
  pageId: dto.pageNumber?.toString() || '',
  chapterId: '',
  seriesId: dto.mangakaId?.toString() || '',
  mangakaId: dto.mangakaId?.toString() || '',
  assignedAssistantId: dto.assistantId?.toString() || '',
  assignedAssistantName: dto.assistantName || '',
  status: mapTaskStatus(dto.status),
  amount: dto.paymentAmount || 0,
  deadline: dto.deadline || new Date().toISOString(),
  extensionUsed: !!dto.extensionRequestDays,
  onLeave: false,
  createdAt: dto.createAt || new Date().toISOString(),
  updatedAt: dto.updateAt || new Date().toISOString(),
});

// ─── Request DTOs ────────────────────────────────────────────

export interface CreateTaskRequest {
  regionId: number;
  description?: string;
  assistantId?: string;
  paymentAmount: number;
  deadline: string;
  zIndex_Order?: number;
}

export interface SubmitTaskResultRequest {
  taskId: string;
  image: File;
  comment?: string;
}

export interface RequestExtensionRequest {
  taskId: string;
  days: 1 | 2;
  reason: string;
}

// ─── Mock helpers ────────────────────────────────────────────
const mockDelay = (ms: number = 50) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createMockAxiosResponse = createMockApiResponse;

const createMockPaginatedResponse = <T>(
  items: T[],
  page = 1,
  pageSize = 20,
) => {
  const start = (page - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);
  return createMockApiResponse({
    items: paginatedItems,
    pageNumber: page,
    pageSize,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / pageSize) || 1,
    hasPreviousPage: page > 1,
    hasNextPage: page * pageSize < items.length,
  });
};

const mapMockTaskToTasksDto = (t: MockTask): components['schemas']['TasksDto'] => {
  const parseMockNumericId = (value: string, fallback = 1): number => {
    const parsed = parseInt(value.replace(/[^0-9]/g, '') || String(fallback), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  return {
    id: parseMockNumericId(t.id),
    description: t.taskName,
    regionId: parseMockNumericId(t.regionId),
    paymentAmount: t.amount,
    status: t.status,
    deadline: t.deadline,
    assistantName: t.assignedAssistantName ?? undefined,
    pageNumber: parseInt(t.pageName.replace(/[^0-9]/g, '') || '1', 10),
    extensionRequestDays: t.extensionRequestDays,
    extensionReason: t.extensionReason,
    extensionStatus: t.extensionStatus,
    createAt: t.createdAt,
    updateAt: t.updatedAt,
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
      return createMockPaginatedResponse(
        filtered.map(mapMockTaskToTasksDto),
        params?.page,
        params?.pageSize,
      );
    }
    return axiosInstance.get<PagedApiResponse<TasksDto>>('/api/tasks/mangaka-list', { params });
  },

  // Backend API ready (feat/assistant-available-tasks) — always call real endpoint
  getAvailableTasks: async (params?: { page?: number; pageSize?: number; skill?: string }) => {
    if (USE_MOCK) {
      await mockDelay(300);
      let filtered = MOCK_TASKS.filter((t) => t.status === 'Pending');
      if (params?.skill) {
        filtered = filtered.filter((t) => t.taskName.toLowerCase().includes(params.skill!.toLowerCase()));
      }
      const mappedDtos = filtered.map(mapMockTaskToTasksDto);
      return createMockPaginatedResponse(mappedDtos, params?.page, params?.pageSize);
    }
    return axiosInstance.get('/api/tasks/available', {
      params: {
        pageNumber: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
        ...(params?.skill ? { skill: params.skill } : {}),
      },
    });
  },

  // Assistant's own tasks
  getAssistantMyTasks: async (params?: { page?: number; pageSize?: number }) => {
    if (USE_MOCK) {
      await mockDelay(300);
      const filtered = MOCK_TASKS.filter((t) => 
        ['In_Progress', 'Pending_Review', 'Approved', 'Disputed', 'Revision'].includes(t.status) &&
        (t.assignedAssistantName === 'Nguyễn Sơn' || t.assignedAssistantName === 'Minh Anh')
      );
      const mappedDtos = filtered.map(mapMockTaskToTasksDto);
      return createMockPaginatedResponse(mappedDtos, params?.page, params?.pageSize);
    }
    return axiosInstance.get('/api/tasks/my-tasks', {
      params: {
        pageNumber: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
  },

  getById: async (taskId: string) => {
    if (USE_MOCK) {
      await mockDelay(200);
      const task = MOCK_TASKS.find((t) => t.id === taskId);
      if (!task) {
        return { data: { success: false, statusCode: 404, message: 'Task not found', data: null } };
      }
      return createMockAxiosResponse(task);
    }
    return axiosInstance.get<ApiResponse<TasksDto>>(`/api/tasks/${taskId}`);
  },

  // Mangaka creates task (F2.3) — triggers Lock (T01)
  create: async (data: CreateTaskRequest) => {
    if (USE_MOCK) {
      await mockDelay(600);
      const newTask: MockTask = {
        id: `task-${Date.now()}`,
        taskName: data.description || 'Task mới',
        regionId: String(data.regionId),
        regionLabel: 'Vùng mới',
        pageId: 'page-1',
        pageName: 'Trang 1',
        chapterId: 'ch-1',
        chapterTitle: 'Ch.1: Khởi đầu',
        seriesId: 's-1',
        seriesTitle: 'Huyền Thoại Samurai',
        assignedAssistantName: null,
        status: 'Pending',
        amount: data.paymentAmount,
        deadline: data.deadline,
        extensionUsed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_TASKS.unshift(newTask);

      // Simulate Wallet Lock (Rule F03 & T01)
      const amountToLock = data.paymentAmount;
      const availableSF = MOCK_WALLET.setupFundBalance; 
      const sfPortion = Math.min(amountToLock, availableSF);
      const wbPortion = amountToLock - sfPortion;

      MOCK_WALLET.setupFundBalance -= sfPortion;
      MOCK_WALLET.withdrawableBalance -= wbPortion;
      MOCK_WALLET.lockedAmount += amountToLock;

      MOCK_TRANSACTIONS.unshift({
        id: `tx-${Date.now()}`,
        type: 'Lock',
        amount: -amountToLock,
        setupFundAmount: -sfPortion,
        withdrawableAmount: -wbPortion,
        referenceId: newTask.id,
        referenceCode: `TASK-${newTask.id.slice(-4).toUpperCase()}`,
        description: `Lock tiền cho Task: ${newTask.taskName}`,
        createdAt: new Date().toISOString(),
      });

      return createMockAxiosResponse(newTask as unknown as TasksDto);
    }
    return axiosInstance.post<ApiResponse<TasksDto>>('/api/tasks', data);
  },

  // Assistant accepts task (F2.6)
  accept: async (taskId: string) => {
    if (USE_MOCK) {
      await mockDelay(400);
      const task = MOCK_TASKS.find((t) => t.id === taskId || t.id === `task-${taskId}`);
      if (task) {
        task.status = 'In_Progress';
        task.assignedAssistantName = 'Nguyễn Sơn';
      }
      return createMockAxiosResponse(task as unknown as TasksDto, 'Nhận việc thành công');
    }
    return axiosInstance.post<ApiResponse<TasksDto>>(`/api/tasks/${taskId}/accept`);
  },

  // Upload file (dùng cho submitResult)
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post<ApiResponse<string>>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  // Assistant downloads resource (F2.7)
  downloadResource: (taskId: string) =>
    axiosInstance.get(`/api/tasks/${taskId}/resource`, { responseType: 'blob' }),

  // Assistant submits result (F2.8)
  submitResult: async (taskId: string, data: SubmitTaskResultRequest) => {
    if (USE_MOCK) {
      await mockDelay(600);
      const task = MOCK_TASKS.find((t) => t.id === taskId || t.id === `task-${taskId}`);
      if (task) {
        task.status = 'Pending_Review';
        if (data.image) {
          task.resultImageUrl = URL.createObjectURL(data.image);
        }
      }
      return createMockAxiosResponse({ taskId } as unknown as TaskVersionDto, 'Nộp bài thành công');
    }
    
    // 1. Upload file trước để lấy URL
    const fileUrl = await taskApi.uploadFile(data.image);
    if (!fileUrl) {
      throw new Error('Upload file thất bại');
    }

    // 2. Gọi API submit
    return axiosInstance.post<ApiResponse<unknown>>(`/api/tasks/${taskId}/submit`, {
      submittedFileUrl: fileUrl,
    });
  },

  // Mangaka reviews (F1.10)
  approve: async (taskId: string) => {
    if (USE_MOCK) {
      await mockDelay(500);
      const task = MOCK_TASKS.find((t) => t.id === taskId || t.id === `task-${taskId}`);
      if (task) {
        task.status = 'Approved';
        
        // Mock Transfer
        MOCK_WALLET.lockedAmount -= task.amount;
        // Assistant gets money (we simulate by not actually adding to mangaka wallet, just unlocking it from mangaka)
        MOCK_TRANSACTIONS.unshift({
          id: `tx-${Date.now()}`,
          type: 'Transfer',
          amount: -task.amount,
          setupFundAmount: 0,
          withdrawableAmount: 0,
          referenceId: task.id,
          referenceCode: `TRANS-${task.id.slice(-4).toUpperCase()}`,
          description: `Chuyển tiền Task: ${task.taskName} cho Trợ lý`,
          createdAt: new Date().toISOString(),
        });
      }
      return createMockAxiosResponse(task as unknown as TasksDto, 'Duyệt thành công');
    }
    return axiosInstance.post<ApiResponse<unknown>>(`/api/tasks/${taskId}/approve`, {});
  },

  requestRevision: async (taskId: string, payload: { feedbackComment: string; revisionExtensionHours: number; coordinatesJson: string }) => {
    if (USE_MOCK) {
      await mockDelay(500);
      const task = MOCK_TASKS.find((t) => t.id === taskId || t.id === `task-${taskId}`);
      if (task) {
        task.status = 'Revision';
        task.feedbackComment = payload.feedbackComment;
        const oldDeadline = new Date(task.deadline);
        oldDeadline.setHours(oldDeadline.getHours() + payload.revisionExtensionHours);
        task.deadline = oldDeadline.toISOString();
      }
      return createMockAxiosResponse(task as unknown as TasksDto, 'Yêu cầu sửa bài thành công');
    }
    return axiosInstance.post<ApiResponse<unknown>>(`/api/tasks/${taskId}/reject`, payload);
  },

  // Extension (F2.12) — POST /api/tasks/{id}/request-extension
  requestExtension: async (data: RequestExtensionRequest) => {
    if (USE_MOCK) {
      await mockDelay(400);
      const task = MOCK_TASKS.find((t) => t.id === data.taskId);
      if (task) {
        task.extensionRequestDays = data.days;
        task.extensionReason = data.reason;
        task.extensionStatus = 'Pending';
      }
      return createMockAxiosResponse(task as unknown as TasksDto, 'Xin gia hạn thành công');
    }
    const payload: components['schemas']['RequestExtensionDto'] = {
      days: data.days,
      reason: data.reason,
    };
    return axiosInstance.post<ApiResponse<unknown>>(
      `/api/tasks/${data.taskId}/request-extension`,
      payload,
    );
  },

  approveExtension: async (taskId: string, approve: boolean) =>
    axiosInstance.post<ApiResponse<unknown>>(
      `/api/tasks/${taskId}/extension-approval?approve=${approve}`,
    ),

  // Cancel (T03b, T05)
  cancel: (taskId: string, reason?: string) =>
    axiosInstance.post<ApiResponse<TasksDto>>(`/api/tasks/${taskId}/emergency-cancel`, { reason }),

  // Task versions (T07)
  getVersions: (taskId: string) =>
    axiosInstance.get<ApiResponse<TaskVersionDto[]>>(`/api/tasks/${taskId}/versions`),

  getAnnotationsByTaskVersion: (taskVersionId: string) =>
    axiosInstance.get<ApiResponse<AnnotationDto[]>>(
      '/api/annotations',
      { params: { taskVersionId } },
    ),

  /** Ảnh trang đã gộp các lớp Task Approved (auto-composite) */
  getCompositePage: (pageId: string) =>
    axiosInstance.get<Blob>(`/api/tasks/pages/${pageId}/composite`, {
      responseType: 'blob',
    }),

  /** Tạo lại ảnh gộp và cập nhật CompositeImageUrl trên server */
  refreshCompositePage: (pageId: string) =>
    axiosInstance.post<ApiResponse<string>>(`/api/tasks/pages/${pageId}/refresh-composite`),
};
