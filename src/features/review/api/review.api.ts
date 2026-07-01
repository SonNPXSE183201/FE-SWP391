import { axiosInstance } from '../../../api/axios';
import { createMockApiResponse } from '../../../api/apiResponse';
import type {
  ApiResponse,
  SeriesReviewDto,
  SubmitToBoardDto,
} from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';
import type { ApproveChapterPayload, ChapterReviewDetail, ReviewQueueItem } from '../types';
import { MOCK_REVIEW_QUEUE, buildChapterReviewDetail } from '../data/mockData';
import { isAxiosError } from 'axios';

const USE_MOCK = false;

const mockDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const mockResponse = createMockApiResponse;

// Re-export for component usage
export type { SeriesReviewDto };
export type AnnotationDto = components['schemas']['AnnotationDto'];

// ─── Mock Data (fallback) ───
const MOCK_SERIES_REVIEW: SeriesReviewDto = {
  id: 1,
  title: 'Huyền Thoại Samurai',
  genre: 'Shōnen, Action, Historical',
  synopsis: 'Trong thời đại Edo đầy biến động, một samurai trẻ tên Kenji phải tìm lại thanh kiếm bị đánh cắp của gia tộc trước khi thế lực bóng tối thống trị thiên hạ.',
  coverArtworkUrl: '',
  resourceFolderUrl: null,
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

const PENDING_SERIES_STATUSES = new Set(['Pending_Approval']);

/** BE chưa có GET /api/reviews/series/pending (route bị nuốt bởi series/{id}). Fallback: gom từ chapter queue + probe id khi dev. */
const fetchPendingSeriesForEditor = async (): Promise<SeriesReviewDto[]> => {
  try {
    const res = await axiosInstance.get<ApiResponse<SeriesReviewDto[]>>('/api/reviews/series/pending');
    if (res.data?.success && res.data.data?.length) return res.data.data;
  } catch (err) {
    if (!isAxiosError(err) || (err.response?.status !== 400 && err.response?.status !== 404)) {
      throw err;
    }
  }

  const seriesIds = new Set<number>();

  const chaptersRes = await axiosInstance.get<ApiResponse<ReviewQueueItem[]>>('/api/reviews/chapters');
  for (const ch of chaptersRes.data?.data ?? []) {
    const sid = ch.seriesId;
    if (sid != null) seriesIds.add(Number(sid));
  }

  const statsRes = await axiosInstance.get<ApiResponse<components['schemas']['DashboardStatsResponseDto']>>(
    '/api/dashboard/stats',
  );
  const pendingCount = statsRes.data?.data?.pendingSeries ?? 0;

  if (seriesIds.size === 0 && pendingCount > 0 && import.meta.env.DEV) {
    for (let id = 1; id <= 20; id++) {
      try {
        const r = await axiosInstance.get<ApiResponse<SeriesReviewDto>>(`/api/reviews/series/${id}`);
        const row = r.data?.data;
        if (row?.status && PENDING_SERIES_STATUSES.has(row.status)) {
          seriesIds.add(id);
        }
      } catch {
        // skip missing ids
      }
    }
  }

  const reviews = await Promise.all(
    [...seriesIds].map(async (id) => {
      const r = await axiosInstance.get<ApiResponse<SeriesReviewDto>>(`/api/reviews/series/${id}`);
      return r.data?.data ?? null;
    }),
  );

  return reviews.filter((row): row is SeriesReviewDto => row != null);
};

export const reviewApi = {
  /** GET /api/reviews/series/pending — series chờ Editor duyệt bản thảo (PA3) */
  getPendingSeries: async () => {
    const data = await fetchPendingSeriesForEditor();
    return {
      data: {
        success: true,
        statusCode: 200,
        message: 'Lấy danh sách series chờ duyệt thành công.',
        data,
      } satisfies ApiResponse<SeriesReviewDto[]>,
    };
  },

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
  submitToBoard: async (
    seriesId: string,
    payload: { notes: string; editorRecommendedBudget?: number },
  ) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã trình Hội đồng thành công');
    }
    const body: SubmitToBoardDto & { editorRecommendedBudget?: number } = {
      notes: payload.notes,
      editorRecommendedBudget: payload.editorRecommendedBudget,
    };
    return axiosInstance.post<ApiResponse<boolean>>(`/api/reviews/series/${seriesId}/submit-to-board`, body);
  },

  /** POST /api/reviews/series/{id}/require-revision — Editor yêu cầu Mangaka chỉnh sửa */
  requireRevision: async (
    seriesId: string,
    payload: { comment: string; suggestedBudget?: number; failedChecklistItems?: string[] },
  ) => {
    return axiosInstance.post<ApiResponse<unknown>>(
      `/api/reviews/series/${seriesId}/require-revision`,
      {
        comment: payload.comment,
        suggestedBudget: payload.suggestedBudget,
        failedChecklistItems: payload.failedChecklistItems,
      },
    );
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
      { feedbackComment: reason },
    );
    return res;
  },

  listAnnotations: async (params: { pageId?: string; taskVersionId?: string }) => {
    const res = await axiosInstance.get<ApiResponse<AnnotationDto[]>>('/api/annotations', {
      params: {
        ...(params.pageId ? { pageId: Number(params.pageId) } : {}),
        ...(params.taskVersionId ? { taskVersionId: Number(params.taskVersionId) } : {}),
      },
    });
    return res;
  },

  createAnnotation: async (payload: {
    pageId: string;
    x: number;
    y: number;
    comment: string;
    type: string;
  }) => {
    const res = await axiosInstance.post<ApiResponse<AnnotationDto>>('/api/annotations', {
      pageId: Number(payload.pageId),
      coordinatesJson: JSON.stringify({ top: payload.y, left: payload.x, width: 0, height: 0 }),
      comment: payload.comment,
      type: payload.type,
    });
    return res;
  },

  updateAnnotation: async (annotationId: string, payload: {
    pageId: string;
    x: number;
    y: number;
    comment: string;
    type: string;
  }) => {
    const res = await axiosInstance.put<ApiResponse<AnnotationDto>>(`/api/annotations/${annotationId}`, {
      pageId: Number(payload.pageId),
      coordinatesJson: JSON.stringify({ top: payload.y, left: payload.x, width: 0, height: 0 }),
      comment: payload.comment,
      type: payload.type,
    });
    return res;
  },

  deleteAnnotation: async (annotationId: string) => {
    const res = await axiosInstance.delete<ApiResponse<unknown>>(`/api/annotations/${annotationId}`);
    return res;
  },
};
