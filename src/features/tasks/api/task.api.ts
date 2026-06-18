import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  TasksDto,
  TaskVersionDto,
  PagedApiResponse,
} from '../../../api/generated/types';
import { MOCK_TASKS } from '../data/mockData';
import type { MockTask } from '../data/mockData';
import { MOCK_WALLET, MOCK_TRANSACTIONS } from '../../wallet/data/mockData';

// ─── Toggle this to false when backend Tasks API is ready ────
const USE_MOCK = true;

// ─── Request DTOs ────────────────────────────────────────────

export interface CreateTaskRequest {
  regionId: string;
  taskName?: string;
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
const mockDelay = (ms: number = 50) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createMockAxiosResponse = <T>(data: T, message = 'Success') => ({
  data: {
    success: true,
    IsSuccess: true,
    message: message,
    Message: message,
    data: data,
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
      success: true,
      IsSuccess: true,
      message: 'Success',
      Message: 'Success',
      data: paginatedItems,
      Data: paginatedItems,
      totalCount: items.length,
      TotalCount: items.length,
      pageNumber: page,
      PageNumber: page,
      pageSize: pageSize,
      PageSize: pageSize,
      totalPages: Math.ceil(items.length / pageSize),
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
    return axiosInstance.get<PagedApiResponse<TasksDto>>('/api/tasks/my', { params });
  },

  // Backend API ready (feat/assistant-available-tasks) — always call real endpoint
  getAvailableTasks: async (params?: { page?: number; pageSize?: number; skill?: string }) => {
    if (USE_MOCK) {
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
    return axiosInstance.get('/api/tasks/available', {
      params: {
        PageNumber: params?.page ?? 1,
        PageSize: params?.pageSize ?? 10,
        ...(params?.skill ? { Skill: params.skill } : {}),
      },
    });
  },

  // Assistant's own tasks
  getAssistantMyTasks: async (params?: { page?: number; pageSize?: number }) => {
    if (USE_MOCK) {
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
    }
    return axiosInstance.get('/api/tasks/assistant-my', {
      params: {
        PageNumber: params?.page ?? 1,
        PageSize: params?.pageSize ?? 10,
      },
    });
  },

  getById: async (taskId: string) => {
    if (USE_MOCK) {
      await mockDelay(200);
      const task = MOCK_TASKS.find((t) => t.id === taskId);
      if (!task) {
        return { data: { IsSuccess: false, success: false, Message: 'Task not found', Data: null } };
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
        taskName: data.taskName || 'Task mới',
        regionId: data.regionId,
        regionLabel: 'Vùng mới',
        pageId: 'page-1',
        pageName: 'Trang 1',
        chapterId: 'ch-1',
        chapterTitle: 'Ch.1: Khởi đầu',
        seriesId: 's-1',
        seriesTitle: 'Huyền Thoại Samurai',
        assignedAssistantName: null,
        status: 'Pending',
        amount: data.amount,
        deadline: data.deadline,
        extensionUsed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_TASKS.unshift(newTask);

      // Simulate Wallet Lock (Rule F03 & T01)
      const amountToLock = data.amount;
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
    return axiosInstance.put<ApiResponse<TasksDto>>(`/api/tasks/${taskId}/accept`);
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
    const formData = new FormData();
    formData.append('image', data.image);
    if (data.comment) formData.append('comment', data.comment);
    return axiosInstance.post<ApiResponse<TaskVersionDto>>(`/api/tasks/${taskId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
    return axiosInstance.put<ApiResponse<TasksDto>>(`/api/tasks/${taskId}/approve`);
  },

  requestRevision: async (taskId: string, comment: string, extensionHours: 24 | 48) => {
    if (USE_MOCK) {
      await mockDelay(500);
      const task = MOCK_TASKS.find((t) => t.id === taskId || t.id === `task-${taskId}`);
      if (task) {
        task.status = 'Revision';
        task.feedbackComment = comment;
        // Mock extending deadline by extensionHours
        const oldDeadline = new Date(task.deadline);
        oldDeadline.setHours(oldDeadline.getHours() + extensionHours);
        task.deadline = oldDeadline.toISOString();
      }
      return createMockAxiosResponse(task as unknown as TasksDto, 'Yêu cầu sửa bài thành công');
    }
    return axiosInstance.put<ApiResponse<TasksDto>>(`/api/tasks/${taskId}/revision`, { comment, extensionHours });
  },

  // Extension (T08)
  requestExtension: (data: RequestExtensionRequest) =>
    axiosInstance.put<ApiResponse<TasksDto>>(`/api/tasks/${data.taskId}/extend`, data),

  // Cancel (T03b, T05)
  cancel: (taskId: string, reason?: string) =>
    axiosInstance.put<ApiResponse<TasksDto>>(`/api/tasks/${taskId}/cancel`, { reason }),

  // On_Leave toggle (F2.14)
  toggleOnLeave: (onLeave: boolean) =>
    axiosInstance.put<ApiResponse<null>>('/api/tasks/on-leave', { onLeave }),

  // Task versions (T07)
  getVersions: (taskId: string) =>
    axiosInstance.get<ApiResponse<TaskVersionDto[]>>(`/api/tasks/${taskId}/versions`),
};
