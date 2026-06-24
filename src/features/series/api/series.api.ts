import { axiosInstance, createMockApiResponse } from '../../../api/axios';
import type {
  ApiResponse,
  SeriesDto,
  ChapterDto,
  PageDto,
  PagedApiResponse,
  CreateSeriesDto,
} from '../../../api/generated/types';
import { MOCK_SERIES, MOCK_CHAPTERS } from '../data/mockData';
import { getPagesByChapterId } from '../data/mockPages';
import { isAxiosError } from 'axios';

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

// ─── readWithFallback: try real API, fallback to mock on 404/501 ─
 
const readWithFallback = async <T>(
  fetcher: () => Promise<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockFn: () => Promise<any>,
): Promise<T> => {
  try {
    return await fetcher();
  } catch (err) {
    if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
      console.warn('[series.api] BE returned', err.response?.status, '— falling back to mock data');
      return mockFn();
    }
    throw err;
  }
};

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axiosInstance.post<ApiResponse<string>>('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const url = res.data.data;
  if (!url) {
    throw new Error('Upload file thất bại');
  }
  return url;
};

const buildSeriesUpdatePayload = (
  snapshot: {
    title: string;
    synopsis: string;
    genre: string[];
    coverImageUrl: string;
    estimatedProductionBudget: number;
  },
  resourceFolderUrl: string | null,
): CreateSeriesDto => ({
  title: snapshot.title,
  synopsis: snapshot.synopsis,
  genre: snapshot.genre.join(','),
  coverArtworkUrl: snapshot.coverImageUrl,
  estimatedProductionBudget: snapshot.estimatedProductionBudget,
  resourceFolderUrl,
});

// ─── API Functions ───────────────────────────────────────────

export const seriesApi = {
  /** POST /api/upload — dùng chung cho ảnh bìa, Name PDF, … */
  uploadSeriesFile: uploadFile,

  /**
   * F1.2 — Upload Name đã có URL → lưu vào Series.ResourceFolderUrl qua PUT.
   */
  saveNameManuscript: (
    seriesId: string,
    snapshot: {
      title: string;
      synopsis: string;
      genre: string[];
      coverImageUrl: string;
      estimatedProductionBudget: number;
    },
    resourceFolderUrl: string | null,
  ) => axiosInstance.put<ApiResponse<SeriesDto>>(
    `/api/series/${seriesId}`,
    buildSeriesUpdatePayload(snapshot, resourceFolderUrl),
  ),
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
    if (USE_MOCK) {
      await mockDelay(200);
      const series = MOCK_SERIES.find((s) => s.id === seriesId);
      if (!series) {
        return createMockAxiosResponse(MOCK_SERIES[0]);
      }
      return createMockAxiosResponse(series);
    }
    return readWithFallback(
      () => axiosInstance.get<ApiResponse<SeriesDto>>(`/api/series/${seriesId}`),
      async () => {
        console.info('[series.api] getById fallback mock for seriesId:', seriesId);
        await mockDelay(200);
        const series = MOCK_SERIES.find((s) => s.id === seriesId);
        return createMockAxiosResponse(series ?? { ...MOCK_SERIES[0], id: seriesId });
      },
    );
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
        title: data.title || '',
        synopsis: data.synopsis || '',
        genre: data.genre ? data.genre.split(',') : [],
        coverImageUrl: data.coverImage ? URL.createObjectURL(data.coverImage) : 'https://placehold.co/400x600/1A1A24/E2E8F0?text=New+Series',
        status: 'Draft',
        chapterCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      MOCK_SERIES.unshift(newSeries as any);
      return createMockAxiosResponse(newSeries, 'Tạo Series thành công!');
    }

    if (!data.coverImage) {
      throw new Error('Ảnh bìa là bắt buộc');
    }

    const coverArtworkUrl = await uploadFile(data.coverImage);

    const payload = {
      title: data.title,
      synopsis: data.synopsis,
      genre: data.genre,
      estimatedProductionBudget: data.estimatedProductionBudget,
      coverArtworkUrl,
    };
    return axiosInstance.post<ApiResponse<SeriesDto>>('/api/series', payload);
  },

  update: async (seriesId: string, data: UpdateSeriesRequest) => {
    let coverArtworkUrl: string | undefined;
    if (data.coverImage) {
      coverArtworkUrl = await uploadFile(data.coverImage);
    }

    const payload = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.synopsis !== undefined && { synopsis: data.synopsis }),
      ...(data.genre !== undefined && { genre: data.genre.join(',') }),
      ...(coverArtworkUrl !== undefined && { coverArtworkUrl }),
    };

    return axiosInstance.put<ApiResponse<SeriesDto>>(`/api/series/${seriesId}`, payload);
  },

  // Series review and absence
  submitReview: (seriesId: string, data: SubmitSeriesReviewRequest) =>
    axiosInstance.post<ApiResponse<null>>(`/api/series/${seriesId}/submit-review`, data),

  /** F02 — Mangaka xác nhận nhận vốn sau khi Board duyệt (Fund_Pending → Active) */
  acceptFund: (seriesId: string) =>
    axiosInstance.post<ApiResponse<null>>(`/api/series/${seriesId}/accept-fund`),

  toggleOnLeave: (onLeave: boolean) =>
    axiosInstance.post<ApiResponse<null>>(`/api/series/absence?onLeave=${onLeave}`),

  // Chapter operations
  getChapters: async (seriesId: string, params?: { page?: number; pageSize?: number }) => {
    if (USE_MOCK) {
      await mockDelay(300);
      const chapters = [...MOCK_CHAPTERS]
        .filter((ch) => ch.seriesId === seriesId)
        .sort((a, b) => a.chapterNumber - b.chapterNumber);
      return createMockPaginatedResponse(chapters, params?.page, params?.pageSize);
    }
    return readWithFallback(
      () => axiosInstance.get<ApiResponse<ChapterDto[]>>(`/api/series/${seriesId}/chapters`, { params }),
      async () => {
        console.info('[series.api] getChapters fallback mock for seriesId:', seriesId);
        await mockDelay(300);
        const chapters = [...MOCK_CHAPTERS]
          .sort((a, b) => a.chapterNumber - b.chapterNumber);
        return createMockPaginatedResponse(chapters, params?.page, params?.pageSize);
      },
    );
  },

  getChapterById: async (chapterId: string) => {
    if (USE_MOCK) {
      await mockDelay(200);
      const chapter = MOCK_CHAPTERS.find((ch) => ch.id === chapterId);
      if (!chapter) {
        return createMockAxiosResponse(MOCK_CHAPTERS[0]);
      }
      return createMockAxiosResponse(chapter);
    }
    return readWithFallback(
      () => axiosInstance.get<ApiResponse<ChapterDto>>(`/api/chapters/${chapterId}`),
      async () => {
        console.info('[series.api] getChapterById fallback mock for chapterId:', chapterId);
        await mockDelay(200);
        const chapter = MOCK_CHAPTERS.find((ch) => ch.id === chapterId);
        return createMockAxiosResponse(chapter ?? MOCK_CHAPTERS[0]);
      },
    );
  },

  // Pages for a chapter
  getPages: async (chapterId: string) => {
    if (USE_MOCK) {
      await mockDelay(200);
      const pages = getPagesByChapterId(chapterId);
      return createMockAxiosResponse(pages.length > 0 ? pages : getPagesByChapterId('1'));
    }
    return readWithFallback(
      () => axiosInstance.get<ApiResponse<PageDto[]>>(`/api/chapters/${chapterId}/pages`),
      async () => {
        console.info('[series.api] getPages fallback mock for chapterId:', chapterId);
        await mockDelay(200);
        const pages = getPagesByChapterId(chapterId);
        return createMockAxiosResponse(pages.length > 0 ? pages : getPagesByChapterId('1'));
      },
    );
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

export type SeriesNameUpdateSnapshot = Parameters<typeof seriesApi.saveNameManuscript>[1];
