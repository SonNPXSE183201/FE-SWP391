import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  SeriesDto,
  ChapterDto,
  PageDto,
  PagedApiResponse,
  CreateSeriesDto,
  SubmitSeriesReviewDto,
} from '../../../api/generated/types';
import { isAxiosError } from 'axios';
import type { CreateSeriesRequest, UpdateSeriesRequest, SubmitChapterRequest } from '../types/upload.types';

export type { CreateSeriesRequest, UpdateSeriesRequest, SubmitChapterRequest };
export type SubmitSeriesReviewRequest = SubmitSeriesReviewDto;

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

const buildDirectApiUrl = (path: string): string => {
  const configuredBase = (import.meta.env.VITE_MPS_SERVICE_URL as string | undefined)?.trim();
  const base =
    configuredBase ||
    (import.meta.env.DEV
      ? 'http://localhost:5010'
      : typeof window !== 'undefined'
        ? window.location.origin
        : '');
  return `${base.replace(/\/$/, '')}${path}`;
};

export const seriesApi = {
  uploadSeriesFile: uploadFile,

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
  ) =>
    axiosInstance.put<ApiResponse<SeriesDto>>(
      `/api/series/${seriesId}`,
      buildSeriesUpdatePayload(snapshot, resourceFolderUrl),
    ),

  getAll: async (params?: { page?: number; pageSize?: number; status?: string }) =>
    axiosInstance.get<PagedApiResponse<SeriesDto>>('/api/series', { params }),

  getById: async (seriesId: string) =>
    axiosInstance.get<ApiResponse<SeriesDto>>(`/api/series/${seriesId}`),

  getMySeries: async (params?: { page?: number; pageSize?: number }) =>
    axiosInstance.get<ApiResponse<SeriesDto[]>>('/api/series/my-list', { params }),

  create: async (data: CreateSeriesRequest) => {
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

  submitReview: (seriesId: string, data: SubmitSeriesReviewRequest) =>
    axiosInstance.post<ApiResponse<null>>(`/api/series/${seriesId}/submit-review`, data),

  acceptFund: (seriesId: string) =>
    axiosInstance.post<ApiResponse<null>>(`/api/series/${seriesId}/accept-fund`),

  signContract: (seriesId: string) =>
    axiosInstance.post<ApiResponse<null>>(`/api/series/${seriesId}/sign-contract`),

  declineFund: (seriesId: string) =>
    axiosInstance.post<ApiResponse<null>>(`/api/series/${seriesId}/decline-fund`),

  toggleOnLeave: (onLeave: boolean) =>
    axiosInstance.post<ApiResponse<null>>(`/api/series/absence?onLeave=${onLeave}`),

  getChapters: async (seriesId: string, params?: { page?: number; pageSize?: number }) =>
    axiosInstance.get<ApiResponse<ChapterDto[]>>(`/api/series/${seriesId}/chapters`, { params }),

  getChapterById: async (chapterId: string) =>
    axiosInstance.get<ApiResponse<ChapterDto>>(`/api/chapters/${chapterId}`),

  getPages: async (chapterId: string) =>
    axiosInstance.get<ApiResponse<PageDto[]>>(`/api/chapters/${chapterId}/pages`),

  submitChapter: (seriesId: string, data: SubmitChapterRequest) => {
    const formData = new FormData();
    formData.append('chapterNumber', data.chapterNumber.toString());
    formData.append('title', data.title);
    data.pages.forEach((p) => formData.append('pages', p));
    return axiosInstance.post<ApiResponse<ChapterDto>>(`/api/series/${seriesId}/chapters`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getChapterProductionReadiness: (chapterId: string) =>
    axiosInstance.get<ApiResponse<Record<string, unknown>>>(
      `/api/chapters/${chapterId}/production-readiness`,
    ),

  submitChapterForReview: (chapterId: string) =>
    axiosInstance.post<ApiResponse<ChapterDto>>(`/api/chapters/${chapterId}/submit-for-review`),

  markPageReady: (pageId: string) =>
    axiosInstance.post<ApiResponse<PageDto>>(`/api/pages/${pageId}/mark-ready`),

  unmarkPageReady: (pageId: string) =>
    axiosInstance.post<ApiResponse<PageDto>>(`/api/pages/${pageId}/unmark-ready`),

  replacePageImage: async (pageId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      return await axiosInstance.post<ApiResponse<PageDto>>(`/api/pages/${pageId}/replace-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        const directUrl = buildDirectApiUrl(`/api/pages/${pageId}/replace-image`);
        return axiosInstance.post<ApiResponse<PageDto>>(directUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      throw err;
    }
  },

  addChapterPages: (chapterId: string, pages: File[]) => {
    const formData = new FormData();
    pages.forEach((p) => formData.append('pages', p));
    return axiosInstance.post<ApiResponse<PageDto[]>>(`/api/chapters/${chapterId}/pages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  requestRevision: (seriesId: string, chapterId: string, comment: string) =>
    axiosInstance.put<ApiResponse<ChapterDto>>(
      `/api/series/${seriesId}/chapters/${chapterId}/revision`,
      { comment },
    ),
};

export type SeriesNameUpdateSnapshot = Parameters<typeof seriesApi.saveNameManuscript>[1];
