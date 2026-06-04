import { axiosInstance } from '../../api/axios';
import type { ApiResponse, PaginatedResponse, Series, Chapter } from '../../types';

// ─── Request DTOs ────────────────────────────────────────────

export interface CreateSeriesRequest {
  title: string;
  synopsis: string;
  genre: string[];
  coverImage?: File;
}

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

// ─── API Functions ───────────────────────────────────────────

export const seriesApi = {
  // Series CRUD
  getAll: (params?: { page?: number; pageSize?: number; status?: string }) =>
    axiosInstance.get<PaginatedResponse<Series>>('/api/series', { params }),

  getById: (seriesId: string) =>
    axiosInstance.get<ApiResponse<Series>>(`/api/series/${seriesId}`),

  getMySeries: (params?: { page?: number; pageSize?: number }) =>
    axiosInstance.get<PaginatedResponse<Series>>('/api/series/my', { params }),

  create: (data: CreateSeriesRequest) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('synopsis', data.synopsis);
    data.genre.forEach((g) => formData.append('genre', g));
    if (data.coverImage) formData.append('coverImage', data.coverImage);
    return axiosInstance.post<ApiResponse<Series>>('/api/series', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: (seriesId: string, data: UpdateSeriesRequest) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.synopsis) formData.append('synopsis', data.synopsis);
    if (data.genre) data.genre.forEach((g) => formData.append('genre', g));
    if (data.coverImage) formData.append('coverImage', data.coverImage);
    return axiosInstance.put<ApiResponse<Series>>(`/api/series/${seriesId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Chapter operations
  getChapters: (seriesId: string, params?: { page?: number; pageSize?: number }) =>
    axiosInstance.get<PaginatedResponse<Chapter>>(`/api/series/${seriesId}/chapters`, { params }),

  submitChapter: (seriesId: string, data: SubmitChapterRequest) => {
    const formData = new FormData();
    formData.append('chapterNumber', data.chapterNumber.toString());
    formData.append('title', data.title);
    data.pages.forEach((p) => formData.append('pages', p));
    return axiosInstance.post<ApiResponse<Chapter>>(`/api/series/${seriesId}/chapters`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Editor approve/reject chapter (F3.6)
  approveChapter: (seriesId: string, chapterId: string) =>
    axiosInstance.put<ApiResponse<Chapter>>(`/api/series/${seriesId}/chapters/${chapterId}/approve`),

  requestRevision: (seriesId: string, chapterId: string, comment: string) =>
    axiosInstance.put<ApiResponse<Chapter>>(`/api/series/${seriesId}/chapters/${chapterId}/revision`, { comment }),
};
