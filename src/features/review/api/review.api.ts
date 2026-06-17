import { axiosInstance, type ApiResponse } from '../../../api/axios';
import type { ApproveChapterPayload, ChapterReviewDetail, ReviewQueueItem } from '../types';
import { MOCK_REVIEW_QUEUE, buildChapterReviewDetail } from '../data/mockData';

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

// UI-specific review detail type (mock shape — different from SeriesDto)
export interface ReviewSeriesDetail {
  id: string;
  title: string;
  synopsis: string;
  genres: string[];
  coverUrl: string;
  mangakaName: string;
  submittedAt: string;
  requestedBudget: number;
  nameFileUrl: string;
  nameFileName: string;
  status: string;
}

export const reviewApi = {
  getReviewSeriesDetail: async (seriesId: string) => {
    const FORCE_MOCK_SERIES = true; // Backend chưa có API duyệt Series
    if (USE_MOCK || FORCE_MOCK_SERIES) {
      await mockDelay();
      return mockResponse<ReviewSeriesDetail>({
        id: seriesId,
        title: 'Huyền Thoại Samurai',
        synopsis: 'Trong thời đại Edo đầy biến động, một samurai trẻ tên Kenji phải tìm lại thanh kiếm bị đánh cắp của gia tộc trước khi thế lực bóng tối thống trị thiên hạ.',
        genres: ['Shōnen', 'Action', 'Historical'],
        coverUrl: '',
        mangakaName: 'Nguyễn Minh Đức',
        submittedAt: '2026-06-01T10:00:00Z',
        requestedBudget: 2500000,
        nameFileUrl: '#',
        nameFileName: 'samurai_name_v1.pdf',
        status: 'Pending_Review',
      });
    }
    // When backend is ready, this will return SeriesDto with PascalCase
    // and the component must be updated to use PascalCase fields.
    return axiosInstance.get<any>(`/api/reviews/series/${seriesId}`);
  },

  submitToBoard: async (seriesId: string, notes: string) => {
    const FORCE_MOCK_SERIES = true;
    if (USE_MOCK || FORCE_MOCK_SERIES) {
      await mockDelay(600);
      return mockResponse(true, 'Đã trình Hội đồng thành công');
    }
    return axiosInstance.post<any>(`/api/reviews/series/${seriesId}/submit-to-board`, { notes });
  },

  requireRevision: async (seriesId: string, reason: string) => {
    const FORCE_MOCK_SERIES = true;
    if (USE_MOCK || FORCE_MOCK_SERIES) {
      await mockDelay(600);
      return mockResponse(true, 'Đã yêu cầu tác giả chỉnh sửa lại Bản thảo');
    }
    return axiosInstance.post<ApiResponse<boolean>>(`/api/reviews/series/${seriesId}/require-revision`, { reason });
  },

  // ─── Chapter QC Review (F3.1, F3.2, F3.6) ──────────────────
  getReviewQueue: async () => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse<ReviewQueueItem[]>(MOCK_REVIEW_QUEUE);
    }
    return axiosInstance.get<ApiResponse<ReviewQueueItem[]>>('/api/reviews/chapters');
  },

  getChapterReview: async (chapterId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse<ChapterReviewDetail | null>(buildChapterReviewDetail(chapterId));
    }
    return axiosInstance.get<ApiResponse<ChapterReviewDetail>>(`/api/reviews/chapters/${chapterId}`);
  },

  // F3.6 — Approve Chapter → triggers Genkoūryō disbursement (G02, G03).
  approveChapter: async (payload: ApproveChapterPayload) => {
    if (USE_MOCK) {
      await mockDelay(700);
      return mockResponse(true, 'Đã duyệt Chapter & giải ngân nhuận bút');
    }
    return axiosInstance.post<ApiResponse<boolean>>(
      `/api/reviews/chapters/${payload.chapterId}/approve`,
      { ValidPageCount: payload.validPageCount, QcChecklistData: "{}" },
    );
  },

  requireChapterRevision: async (chapterId: string, reason: string) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã trả Chapter về cho Mangaka chỉnh sửa');
    }
    return axiosInstance.post<ApiResponse<boolean>>(
      `/api/reviews/chapters/${chapterId}/revision`,
      { FeedbackComment: reason },
    );
  },
};
