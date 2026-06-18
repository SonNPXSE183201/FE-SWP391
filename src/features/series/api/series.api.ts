import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  SeriesDto,
  ChapterDto,
  PageDto,
  PagedApiResponse,
} from '../../../api/generated/types';
import { MOCK_SERIES, MOCK_CHAPTERS } from '../data/mockData';
import { getPagesByChapterId } from '../data/mockPages';

import { components } from '../../../api/generated/schema';

// ─── Toggle this to false when backend Series API is ready ───
const USE_MOCK = false;

// ─── Request DTOs ────────────────────────────────────────────
export type CreateSeriesRequest = components['schemas']['CreateSeriesDto'] & {
  coverImage?: File;
};

export type SubmitSeriesReviewRequest = components['schemas']['SubmitSeriesReviewDto'];

// Fallback manual types for API endpoints not yet in OpenAPI
export interface UpdateSeriesRequest {
  title?: string;
  synopsis?: string;
  genre?: string[];
  coverImage?: File;
}

export interface SubmitChapterRequest {
  chapterNumber: number;
  title: string;
  pages: File[];
}

// ─── Mock helpers ────────────────────────────────────────────
const mockDelay = (ms: number = 50) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createMockAxiosResponse = <T>(data: T, message = 'Success') => ({
  data: {
    IsSuccess: true,
    success: true,
    Message: message,
    Data: data,
  } as unknown as ApiResponse<T>,
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
      IsSuccess: true,
      success: true,
      Message: 'Success',
      Data: paginatedItems,
      TotalCount: items.length,
      PageNumber: page,
      PageSize: pageSize,
      TotalPages: Math.ceil(items.length / pageSize),
    },
  };
};

// ─── API Functions ───────────────────────────────────────────

export const seriesApi = {
  // Series CRUD
  getAll: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    if (USE_MOCK) {
      await mockDelay(300);
      let filtered = MOCK_SERIES;
      if (params?.status) {
        filtered = filtered.filter((s) => s.status === params.status);
      }
      return createMockPaginatedResponse(filtered, params?.page, params?.pageSize);
    }
    return axiosInstance.get<PagedApiResponse<SeriesDto>>('/api/series/my-list', { params });
  },

  getById: async (seriesId: string) => {
    if (true) { // TODO: Remove true when backend implements GET /api/series/{id}
      await mockDelay(200);
      const series = MOCK_SERIES.find((s) => s.id === seriesId);
      if (!series) {
        return { data: { IsSuccess: true, success: true, Message: 'Thành công', Data: { ...MOCK_SERIES[0], id: seriesId } } } as any;
      }
      return createMockAxiosResponse(series);
    }
    return axiosInstance.get<ApiResponse<SeriesDto>>(`/api/series/${seriesId}`);
  },

  getMySeries: async (params?: { page?: number; pageSize?: number }) => {
    if (USE_MOCK) {
      await mockDelay(300);
      return createMockPaginatedResponse(MOCK_SERIES, params?.page, params?.pageSize);
    }
    return axiosInstance.get<ApiResponse<SeriesDto[]>>('/api/series/my-list', { params });
  },

  create: async (data: CreateSeriesRequest) => {
    if (USE_MOCK) {
      await mockDelay(800);
      const newSeries = {
        id: `s-${Date.now()}`,
        mangakaId: 'user-1',
        mangakaName: 'Mangaka Test',
        title: data.Title || '',
        synopsis: data.Synopsis || '',
        genre: data.Genre ? data.Genre.split(',') : [],
        coverImageUrl: data.coverImage ? URL.createObjectURL(data.coverImage) : 'https://placehold.co/400x600/1A1A24/E2E8F0?text=New+Series',
        status: 'Draft',
        chapterCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_SERIES.unshift(newSeries as any);
      return createMockAxiosResponse(newSeries, 'Tạo Series thành công!');
    }

    const payload = {
      Title: data.Title,
      Synopsis: data.Synopsis,
      Genre: data.Genre,
      EstimatedProductionBudget: data.EstimatedProductionBudget,
      CoverArtworkUrl: 'https://placehold.co/400x600/1A1A24/E2E8F0?text=New+Series', // Mock URL since upload API is not ready
    };
    return axiosInstance.post<ApiResponse<SeriesDto>>('/api/series', payload);
  },

  update: (seriesId: string, data: UpdateSeriesRequest) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.synopsis) formData.append('synopsis', data.synopsis);
    if (data.genre) data.genre.forEach((g) => formData.append('genre', g));
    if (data.coverImage) formData.append('coverImage', data.coverImage);
    return axiosInstance.put<ApiResponse<SeriesDto>>(`/api/series/${seriesId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Series review and absence
  submitReview: (seriesId: string, data: SubmitSeriesReviewRequest) =>
    axiosInstance.post<ApiResponse<null>>(`/api/series/${seriesId}/submit-review`, data),

  toggleOnLeave: (onLeave: boolean) =>
    axiosInstance.post<ApiResponse<null>>(`/api/series/absence?onLeave=${onLeave}`),

  // Chapter operations
  getChapters: async (seriesId: string, params?: { page?: number; pageSize?: number }) => {
    if (true) { // TODO: Remove true when backend implements GET /api/series/{id}/chapters
      await mockDelay(300);
      // Return mock chapters regardless of seriesId so user can test the UI
      const chapters = [...MOCK_CHAPTERS]
        .sort((a, b) => a.chapterNumber - b.chapterNumber);
      return createMockPaginatedResponse(chapters, params?.page, params?.pageSize);
    }
    return axiosInstance.get<ApiResponse<ChapterDto[]>>(`/api/series/${seriesId}/chapters`, { params });
  },

  getChapterById: async (chapterId: string) => {
    if (true) { // TODO: Remove when backend implements GET /api/chapters/{id}
      await mockDelay(200);
      const chapter = MOCK_CHAPTERS.find((ch) => ch.id === chapterId);
      if (!chapter) {
        return { data: { IsSuccess: true, success: true, Message: 'Mock Fallback', Data: MOCK_CHAPTERS[0] } } as any;
      }
      return createMockAxiosResponse(chapter);
    }
    return axiosInstance.get<ApiResponse<ChapterDto>>(`/api/chapters/${chapterId}`);
  },

  // Pages for a chapter
  getPages: async (chapterId: string) => {
    if (true) { // TODO: Remove when backend implements GET /api/chapters/{id}/pages
      await mockDelay(200);
      const pages = getPagesByChapterId(chapterId);
      return createMockAxiosResponse(pages.length > 0 ? pages : getPagesByChapterId('1'));
    }
    return axiosInstance.get<ApiResponse<PageDto[]>>(`/api/chapters/${chapterId}/pages`);
  },

  submitChapter: (seriesId: string, data: SubmitChapterRequest) => {
    const formData = new FormData();
    formData.append('chapterNumber', data.chapterNumber.toString());
    formData.append('title', data.title);
    data.pages.forEach((p) => formData.append('pages', p));
    return axiosInstance.post<ApiResponse<ChapterDto>>(`/api/series/${seriesId}/chapters`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Editor approve/reject chapter (F3.6)
  approveChapter: (seriesId: string, chapterId: string) =>
    axiosInstance.put<ApiResponse<ChapterDto>>(`/api/series/${seriesId}/chapters/${chapterId}/approve`),

  requestRevision: (seriesId: string, chapterId: string, comment: string) =>
    axiosInstance.put<ApiResponse<ChapterDto>>(`/api/series/${seriesId}/chapters/${chapterId}/revision`, { comment }),
};
