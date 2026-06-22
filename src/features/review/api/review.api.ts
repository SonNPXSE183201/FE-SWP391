import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  SeriesReviewDto,
  SubmitToBoardDto,
} from '../../../api/generated/types';
import type { ApproveChapterPayload, ChapterReviewDetail, ReviewQueueItem } from '../types';
import { MOCK_REVIEW_QUEUE, buildChapterReviewDetail } from '../data/mockData';
import { isAxiosError } from 'axios';

const USE_MOCK = false;

const mockDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const mockResponse = <T>(data: T, message = 'Success') => ({
  data: {
    IsSuccess: true,
    success: true,
    Message: message,
    Data: data,
  },
});

// Re-export for component usage
export type { SeriesReviewDto };

// ─── Mock Data (fallback) ───
const MOCK_SERIES_REVIEW: SeriesReviewDto = {
  id: 1,
  title: 'Huyền Thoại Samurai',
  genre: 'Shōnen, Action, Historical',
  synopsis: 'Trong thời đại Edo đầy biến động, một samurai trẻ tên Kenji phải tìm lại thanh kiếm bị đánh cắp của gia tộc trước khi thế lực bóng tối thống trị thiên hạ.',
  coverArtworkUrl: '',
  estimatedProductionBudget: 2500000,
  approvedProductionBudget: 0,
  status: 'Pending_Approval',
  mangakaId: 4,
  mangakaName: 'Nguyễn Minh Đức',
  editorName: null,
  chapterCount: 0,
  chapters: [],
  createAt: '2026-06-01T10:00:00Z',
};

const readWithFallback = async <T>(
  fetcher: () => ReturnType<typeof axiosInstance.get<ApiResponse<T>>>,
  mockFn: () => Promise<{ data: ApiResponse<T> }>,
) => {
  try {
    return await fetcher();
  } catch (err) {
    if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
      console.warn('[review.api] BE returned 404/501, falling back to mock data');
      return mockFn();
    }
    throw err;
  }
};

export const reviewApi = {
  /** GET /api/reviews/series/{id} — chi tiết series để Editor review */
  getReviewSeriesDetail: async (seriesId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse<SeriesReviewDto>({ ...MOCK_SERIES_REVIEW, id: parseInt(seriesId, 10) || 1 });
    }
    return readWithFallback(
      () => axiosInstance.get<ApiResponse<SeriesReviewDto>>(`/api/reviews/series/${seriesId}`),
      async () => {
        await mockDelay();
        return mockResponse<SeriesReviewDto>({ ...MOCK_SERIES_REVIEW, id: parseInt(seriesId, 10) || 1 });
      },
    );
  },

  /** POST /api/reviews/series/{id}/submit-to-board — Editor trình lên Board */
  submitToBoard: async (seriesId: string, notes: string) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã trình Hội đồng thành công');
    }
    const body: SubmitToBoardDto = { notes };
    return axiosInstance.post<ApiResponse<boolean>>(`/api/reviews/series/${seriesId}/submit-to-board`, body);
  },

  /** POST require-revision — chưa có BE endpoint, giữ mock */
   
  requireRevision: async (seriesId: string, reason: string) => {
    // TODO: BE chưa có endpoint require-revision cho Series — giữ mock
    // Khi BE ready: return axiosInstance.post(`/api/reviews/series/${seriesId}/require-revision`, { reason });
    console.info('[review.api] requireRevision mock called for series:', seriesId, 'reason:', reason);
    await mockDelay(600);
    return mockResponse(true, 'Đã yêu cầu tác giả chỉnh sửa lại Bản thảo');
  },

  // ─── Chapter QC Review (F3.1, F3.2, F3.6) ──────────────────
  getReviewQueue: async () => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse<ReviewQueueItem[]>(MOCK_REVIEW_QUEUE);
    }
    const res = await axiosInstance.get<ApiResponse<ReviewQueueItem[]>>('/api/reviews/chapters');
    return res;
  },

  getChapterReview: async (chapterId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse<ChapterReviewDetail | null>(buildChapterReviewDetail(chapterId));
    }
    const res = await axiosInstance.get<ApiResponse<ChapterReviewDetail>>(`/api/reviews/chapters/${chapterId}`);
    return res;
  },

  // F3.6 — Approve Chapter → triggers Genkoūryō disbursement (G02, G03).
  approveChapter: async (payload: ApproveChapterPayload) => {
    if (USE_MOCK) {
      await mockDelay(700);
      return mockResponse(true, 'Đã duyệt Chapter & giải ngân nhuận bút');
    }
    const res = await axiosInstance.post<ApiResponse<boolean>>(
      `/api/reviews/chapters/${payload.chapterId}/approve`,
      {
        validPageCount: payload.validPageCount,
        qcChecklistData: JSON.stringify(payload.qcChecklist ?? {}),
      },
    );
    return res;
  },

  requireChapterRevision: async (chapterId: string, reason: string) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã trả Chapter về cho Mangaka chỉnh sửa');
    }
    const res = await axiosInstance.post<ApiResponse<boolean>>(
      `/api/reviews/chapters/${chapterId}/revision`,
      { FeedbackComment: reason },
    );
    return res;
  },
};
