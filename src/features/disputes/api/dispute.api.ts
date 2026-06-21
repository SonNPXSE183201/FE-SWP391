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
    Id: 901,
    TaskId: 10,
    TaskTitle: 'Lineart — Trang 5-8',
    SeriesTitle: 'Huyền Thoại Samurai',
    MangakaName: 'Nguyễn Minh Đức',
    AssistantName: 'Trần Thị Mai',
    LockedAmount: 450000,
    Status: 'Open',
    CreatedAt: '2026-06-10T08:30:00Z',
  },
  {
    Id: 902,
    TaskId: 15,
    TaskTitle: 'Background — Trang 12-14',
    SeriesTitle: 'Tokyo Dreamers',
    MangakaName: 'Lê Thị Hương',
    AssistantName: 'Phạm Quốc Huy',
    LockedAmount: 320000,
    Status: 'Open',
    CreatedAt: '2026-06-09T14:00:00Z',
  },
  {
    Id: 903,
    TaskId: 8,
    TaskTitle: 'Screentone — Trang 1-4',
    SeriesTitle: 'Mecha Genesis',
    MangakaName: 'Hoàng Anh Tuấn',
    AssistantName: 'Nguyễn Văn Long',
    LockedAmount: 280000,
    Status: 'Resolved',
    CreatedAt: '2026-06-05T10:00:00Z',
    ResolvedAt: '2026-06-07T16:30:00Z',
    Resolution: 'Partial_Payment',
  },
];

const MOCK_DISPUTE_DETAIL: Record<number, DisputeDetailDto> = {
  901: {
    Id: 901,
    TaskId: 10,
    TaskTitle: 'Lineart — Trang 5-8',
    SeriesTitle: 'Huyền Thoại Samurai',
    ChapterTitle: 'Chapter 3: Đêm trăng máu',
    MangakaName: 'Nguyễn Minh Đức',
    AssistantName: 'Trần Thị Mai',
    LockedAmount: 450000,
    Status: 'Open',
    CreatedAt: '2026-06-10T08:30:00Z',
    TaskDeadline: '2026-06-08T23:59:59Z',
    TaskSubmittedAt: '2026-06-09T02:15:00Z',
    RegionInfo: 'Region A3 — Panel 2-5, Trang 5-8',
    MangakaReason: 'Chất lượng đường nét không đúng yêu cầu.',
    AssistantReason: 'Đã hoàn thành đúng theo brief ban đầu.',
    Evidence: [],
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
      const listItem = MOCK_DISPUTES.find(d => d.TaskId === numId || d.Id === numId);
      if (listItem) {
        return mockResponse({
          ...listItem,
          ChapterTitle: 'Chapter N/A',
          TaskDeadline: '2026-06-08T23:59:59Z',
          TaskSubmittedAt: '2026-06-09T02:00:00Z',
          RegionInfo: 'Region — N/A',
          MangakaReason: 'Chất lượng không đạt yêu cầu.',
          AssistantReason: 'Đã hoàn thành theo brief.',
          Evidence: [],
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
