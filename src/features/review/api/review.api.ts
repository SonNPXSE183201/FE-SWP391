import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  SeriesReviewDto,
  SubmitToBoardDto,
} from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';
import type { ApproveChapterPayload, ChapterReviewDetail, ReviewQueueItem } from '../types';
import { isAxiosError } from 'axios';

export type { SeriesReviewDto };
export type AnnotationDto = components['schemas']['AnnotationDto'];

const PENDING_SERIES_STATUSES = new Set(['Pending_Approval']);

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

  if (seriesIds.size === 0 && pendingCount > 0) {
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

  getReviewSeriesDetail: async (seriesId: string) =>
    axiosInstance.get<ApiResponse<SeriesReviewDto>>(`/api/reviews/series/${seriesId}`),

  submitToBoard: async (
    seriesId: string,
    payload: { notes: string; editorRecommendedBudget?: number },
  ) => {
    const body: SubmitToBoardDto & { editorRecommendedBudget?: number } = {
      notes: payload.notes,
      editorRecommendedBudget: payload.editorRecommendedBudget,
    };
    return axiosInstance.post<ApiResponse<boolean>>(`/api/reviews/series/${seriesId}/submit-to-board`, body);
  },

  requireRevision: async (
    seriesId: string,
    payload: { comment: string; suggestedBudget?: number; failedChecklistItems?: string[] },
  ) =>
    axiosInstance.post<ApiResponse<unknown>>(`/api/reviews/series/${seriesId}/require-revision`, {
      comment: payload.comment,
      suggestedBudget: payload.suggestedBudget,
      failedChecklistItems: payload.failedChecklistItems,
    }),

  getReviewQueue: async () =>
    axiosInstance.get<ApiResponse<ReviewQueueItem[]>>('/api/reviews/chapters'),

  getChapterReview: async (chapterId: string) =>
    axiosInstance.get<ApiResponse<ChapterReviewDetail>>(`/api/reviews/chapters/${chapterId}`),

  approveChapter: async (payload: ApproveChapterPayload) =>
    axiosInstance.post<ApiResponse<boolean>>(`/api/reviews/chapters/${payload.chapterId}/approve`, {
      validPageCount: payload.validPageCount,
      qcChecklistData: JSON.stringify(payload.qcChecklist ?? {}),
    }),

  requireChapterRevision: async (chapterId: string, reason: string) =>
    axiosInstance.post<ApiResponse<boolean>>(`/api/reviews/chapters/${chapterId}/revision`, {
      feedbackComment: reason,
    }),

  listAnnotations: async (params: { pageId?: string; taskVersionId?: string }) =>
    axiosInstance.get<ApiResponse<AnnotationDto[]>>('/api/annotations', {
      params: {
        ...(params.pageId ? { pageId: Number(params.pageId) } : {}),
        ...(params.taskVersionId ? { taskVersionId: Number(params.taskVersionId) } : {}),
      },
    }),

  createAnnotation: async (payload: {
    pageId: string;
    x: number;
    y: number;
    comment: string;
    type: string;
  }) =>
    axiosInstance.post<ApiResponse<AnnotationDto>>('/api/annotations', {
      pageId: Number(payload.pageId),
      coordinatesJson: JSON.stringify({ top: payload.y, left: payload.x, width: 0, height: 0 }),
      comment: payload.comment,
      type: payload.type,
    }),

  updateAnnotation: async (
    annotationId: string,
    payload: {
      pageId: string;
      x: number;
      y: number;
      comment: string;
      type: string;
    },
  ) =>
    axiosInstance.put<ApiResponse<AnnotationDto>>(`/api/annotations/${annotationId}`, {
      pageId: Number(payload.pageId),
      coordinatesJson: JSON.stringify({ top: payload.y, left: payload.x, width: 0, height: 0 }),
      comment: payload.comment,
      type: payload.type,
    }),

  deleteAnnotation: async (annotationId: string) =>
    axiosInstance.delete<ApiResponse<unknown>>(`/api/annotations/${annotationId}`),
};
