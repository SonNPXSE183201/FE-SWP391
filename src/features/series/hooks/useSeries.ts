import { useQuery } from '@tanstack/react-query';
import { seriesApi } from '../api/series.api';
import type { Series, Chapter, Page } from '../../../types/entities';

// ─── Series List ─────────────────────────────────────────────
export const useSeriesList = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery<Series[], Error>({
    queryKey: ['series', params],
    queryFn: async () => {
      const res = await seriesApi.getAll(params);
      const apiData = res.data as any;
      return apiData.Data ?? apiData.data ?? [];
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

// ─── Series Detail ───────────────────────────────────────────
export const useSeriesDetail = (id?: string) => {
  return useQuery<Series | null, Error>({
    queryKey: ['series', id],
    queryFn: async () => {
      const res = await seriesApi.getById(id as string);
      const apiData = res.data as any;
      if (!apiData.IsSuccess) return null;
      return apiData.Data ?? null;
    },
    enabled: !!id,
    retry: 1,
  });
};

// ─── My Series (Mangaka) ─────────────────────────────────────
export const useMySeries = (params?: { page?: number; pageSize?: number }) => {
  return useQuery<Series[], Error>({
    queryKey: ['series', 'my', params],
    queryFn: async () => {
      const res = await seriesApi.getMySeries(params);
      const apiData = res.data as any;
      return apiData.Data ?? apiData.data ?? [];
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

// ─── Chapters for Series ─────────────────────────────────────
export const useChapters = (seriesId?: string, params?: { page?: number; pageSize?: number }) => {
  return useQuery<Chapter[], Error>({
    queryKey: ['chapters', seriesId, params],
    queryFn: async () => {
      const res = await seriesApi.getChapters(seriesId as string, params);
      const apiData = res.data as any;
      return apiData.Data ?? apiData.data ?? [];
    },
    enabled: !!seriesId,
    staleTime: 1000 * 60,
    retry: 1,
  });
};

// ─── All Chapters (across all series — for Manuscripts) ──────
export const useAllChapters = () => {
  return useQuery<(Chapter & { seriesTitle: string })[], Error>({
    queryKey: ['chapters', 'all'],
    queryFn: async () => {
      // In mock mode, seriesApi.getChapters with empty seriesId won't work.
      // Instead, use getMySeries to get all series, then get chapters for each.
      // For simplicity with USE_MOCK, we call getAll and getChapters directly.
      const seriesRes = await seriesApi.getMySeries({ pageSize: 100 });
      const seriesData = (seriesRes.data as any).Data ?? [];

      const allChapters: (Chapter & { seriesTitle: string })[] = [];
      for (const series of seriesData) {
        const chapRes = await seriesApi.getChapters(series.id, { pageSize: 100 });
        const chapData = (chapRes.data as any).Data ?? [];
        for (const ch of chapData) {
          allChapters.push({ ...ch, seriesTitle: ch.seriesTitle || series.title });
        }
      }
      return allChapters;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

// ─── Chapter Detail ──────────────────────────────────────────
export const useChapterDetail = (chapterId?: string) => {
  return useQuery<(Chapter & { seriesTitle: string }) | null, Error>({
    queryKey: ['chapter', chapterId],
    queryFn: async () => {
      const res = await seriesApi.getChapterById(chapterId as string);
      const apiData = res.data as any;
      if (!apiData.IsSuccess) return null;
      return apiData.Data ?? null;
    },
    enabled: !!chapterId,
    retry: 1,
  });
};

// ─── Pages for Chapter ───────────────────────────────────────
export const useChapterPages = (chapterId?: string) => {
  return useQuery<Page[], Error>({
    queryKey: ['pages', chapterId],
    queryFn: async () => {
      const res = await seriesApi.getPages(chapterId as string);
      const apiData = res.data as any;
      if (!apiData.IsSuccess) return [];
      return apiData.Data ?? [];
    },
    enabled: !!chapterId,
    staleTime: 1000 * 60,
    retry: 1,
  });
};