import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  DisputeListItemDto,
  DisputeDetailDto,
  DisputeEvidenceDto,
} from '../../../api/generated/types';
import { isAxiosError } from 'axios';

/** BE resolve + GET đều đã có trên dev (PR #43) — tắt mock */
const USE_MOCK = false;
const FORCE_MOCK_READ = false;

const mockDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const mockResponse = <T>(data: T, message = 'Success') => ({
  data: {
    IsSuccess: true,
    success: true,
    Message: message,
    Data: data,
  },
});

// Re-export types cho component sử dụng
export type { DisputeListItemDto, DisputeDetailDto, DisputeEvidenceDto };

// ─── Mock Data (fallback khi BE chưa có data / lỗi) ───
const MOCK_DISPUTES: DisputeListItemDto[] = [
  {
    id: 901,
    taskId: 10,
    taskTitle: 'Lineart — Trang 5-8',
    seriesTitle: 'Huyền Thoại Samurai',
    mangakaName: 'Nguyễn Minh Đức',
    assistantName: 'Trần Thị Mai',
    lockedAmount: 450000,
    status: 'Open',
    createdAt: '2026-06-10T08:30:00Z',
  },
  {
    id: 902,
    taskId: 15,
    taskTitle: 'Background — Trang 12-14',
    seriesTitle: 'Tokyo Dreamers',
    mangakaName: 'Lê Thị Hương',
    assistantName: 'Phạm Quốc Huy',
    lockedAmount: 320000,
    status: 'Open',
    createdAt: '2026-06-09T14:00:00Z',
  },
  {
    id: 903,
    taskId: 8,
    taskTitle: 'Screentone — Trang 1-4',
    seriesTitle: 'Mecha Genesis',
    mangakaName: 'Hoàng Anh Tuấn',
    assistantName: 'Nguyễn Văn Long',
    lockedAmount: 280000,
    status: 'Resolved',
    createdAt: '2026-06-05T10:00:00Z',
    resolvedAt: '2026-06-07T16:30:00Z',
    resolution: 'Partial_Payment',
  },
];

const MOCK_DISPUTE_DETAIL: Record<number, DisputeDetailDto> = {
  901: {
    id: 901,
    taskId: 10,
    taskTitle: 'Lineart — Trang 5-8',
    seriesTitle: 'Huyền Thoại Samurai',
    chapterTitle: 'Chapter 3: Đêm trăng máu',
    mangakaName: 'Nguyễn Minh Đức',
    assistantName: 'Trần Thị Mai',
    lockedAmount: 450000,
    status: 'Open',
    createdAt: '2026-06-10T08:30:00Z',
    taskDeadline: '2026-06-08T23:59:59Z',
    taskSubmittedAt: '2026-06-09T02:15:00Z',
    regionInfo: 'Region A3 — Panel 2-5, Trang 5-8',
    mangakaReason: 'Chất lượng đường nét không đúng yêu cầu.',
    assistantReason: 'Đã hoàn thành đúng theo brief ban đầu.',
    evidence: [],
  },
};

const shouldMockRead = () => USE_MOCK || FORCE_MOCK_READ;

const readWithFallback = async <T>(
  fetcher: () => ReturnType<typeof axiosInstance.get<ApiResponse<T>>>,
  mockFn: () => Promise<{ data: ApiResponse<T> }>,
) => {
  if (shouldMockRead()) return mockFn();
  try {
    return await fetcher();
  } catch (err) {
    if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
      console.warn('[dispute.api] BE returned 404/501, falling back to mock data');
      return mockFn();
    }
    throw err;
  }
};

export const disputeApi = {
  /** GET /api/disputes?status= — danh sách tranh chấp */
  getDisputes: async (status?: string) => {
    const queryParam = status ? `?status=${status}` : '';

    return readWithFallback(
      () => axiosInstance.get<ApiResponse<DisputeListItemDto[]>>(`/api/disputes${queryParam}`),
      async () => {
        await mockDelay();
        return mockResponse(MOCK_DISPUTES);
      },
    );
  },

  /** GET /api/disputes/{taskId} — chi tiết tranh chấp theo taskId */
  getDisputeDetail: async (taskId: number | string) => {
    const numId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;

    const mockDetail = async () => {
      await mockDelay(500);
      const detail = MOCK_DISPUTE_DETAIL[numId];
      if (detail) return mockResponse(detail);
      const listItem = MOCK_DISPUTES.find(d => d.taskId === numId || d.id === numId);
      if (listItem) {
        return mockResponse({
          ...listItem,
          chapterTitle: 'Chapter N/A',
          taskDeadline: '2026-06-08T23:59:59Z',
          taskSubmittedAt: '2026-06-09T02:00:00Z',
          regionInfo: 'Region — N/A',
          mangakaReason: 'Bản thảo còn sơ sài',
          assistantReason: 'Đã hoàn thành đúng yêu cầu ban đầu',
          evidence: [],
        } as DisputeDetailDto);
      }
      return mockResponse(null as unknown as DisputeDetailDto);
    };

    return readWithFallback(
      () => axiosInstance.get<ApiResponse<DisputeDetailDto>>(`/api/disputes/${numId}`),
      mockDetail,
    );
  },

  /** POST /api/disputes/{taskId}/resolve — phân xử tranh chấp */
  resolveDispute: async (taskId: number | string, payload: { assistantPaymentPercent: number; editorNote: string }) => {
    const numId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    if (USE_MOCK) {
      await mockDelay(800);
      return mockResponse(true, 'Đã phân xử tranh chấp thành công');
    }
    return axiosInstance.post<ApiResponse<boolean>>(`/api/disputes/${numId}/resolve`, {
      AssistantRate: payload.assistantPaymentPercent,
    });
  },
};
