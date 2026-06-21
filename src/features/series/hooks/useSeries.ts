import { useQuery } from '@tanstack/react-query';
import { seriesApi } from '../api/series.api';
import type { Series, Chapter, Page, SeriesStatus } from '../../../types/entities';
import { components } from '../../../api/generated/schema';

// ─── Mapper ──────────────────────────────────────────────────
const mapSeriesStatus = (status: any): SeriesStatus => {
  if (status === 0 || status === '0') return 'Draft';
  if (status === 1 || status === '1') return 'PendingApproval';
  if (status === 2 || status === '2') return 'Approved';
  if (status === 3 || status === '3') return 'Published';
  if (status === 4 || status === '4') return 'OnHold';
  if (status === 5 || status === '5') return 'Cancelled';
  return (status as SeriesStatus) || 'Draft';
};

export const mapSeriesDtoToEntity = (dto: components['schemas']['SeriesDto']): Series => ({
  id: dto.id?.toString() || '',
  title: dto.title || '',
  synopsis: dto.synopsis || '',
  genre: dto.genre ? dto.genre.split(',') : [],
  coverImageUrl: dto.coverArtworkUrl || '',
  mangakaId: dto.mangakaId?.toString() || '',
  mangakaName: dto.mangakaName || '',
  status: mapSeriesStatus(dto.status),
  chapterCount: 0,
  createdAt: dto.createAt || new Date().toISOString(),
  updatedAt: dto.updateAt || new Date().toISOString(),
});

export const mapPageStatus = (status: any): Page['status'] => {
  if (status === 0 || status === '0') return 'Pending';
  if (status === 1 || status === '1') return 'InProgress';
  if (status === 2 || status === '2') return 'NeedsRevision';
  if (status === 3 || status === '3') return 'Completed';
  return (status as Page['status']) || 'Pending';
};

export const mapPageDtoToEntity = (dto: any): Page => ({
  id: dto.id?.toString() || '',
  chapterId: dto.chapterId?.toString() || '',
  pageNumber: dto.pageNumber || 1,
  imageUrl: dto.imageUrl || '',
  status: mapPageStatus(dto.status),
  regionCount: dto.regionCount || 0,
  createdAt: dto.createAt || new Date().toISOString(),
  updatedAt: dto.updateAt || new Date().toISOString(),
});

// ─── Series List ─────────────────────────────────────────────
export const useSeriesList = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery<Series[], Error>({
    queryKey: ['series', params],
    queryFn: async () => {
      const res = await seriesApi.getAll(params);
      const apiData = res.data as any;
      const dtoArray: components['schemas']['SeriesDto'][] = apiData.Data ?? apiData.data ?? [];
      return dtoArray.map(mapSeriesDtoToEntity);
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
      if (!apiData.IsSuccess || !apiData.Data) return null;
      return mapSeriesDtoToEntity(apiData.Data as components['schemas']['SeriesDto']);
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
      const dtoArray: components['schemas']['SeriesDto'][] = apiData.Data ?? apiData.data ?? [];
      return dtoArray.map(mapSeriesDtoToEntity);
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
      const resData = seriesRes.data as any;
      let seriesData = resData.Data ?? resData.data;
      if (seriesData?.Items) seriesData = seriesData.Items;
      if (seriesData?.items) seriesData = seriesData.items;
      if (!Array.isArray(seriesData)) seriesData = [];

      const allChapters: (Chapter & { seriesTitle: string })[] = [];
      for (const series of seriesData) {
        if (!series.id) continue;
        const chapRes = await seriesApi.getChapters(series.id.toString(), { pageSize: 100 });
        const chapResData = chapRes.data as any;
        let chapData = chapResData.Data ?? chapResData.data;
        if (chapData?.Items) chapData = chapData.Items;
        if (chapData?.items) chapData = chapData.items;
        if (!Array.isArray(chapData)) chapData = [];

        for (const ch of chapData) {
          allChapters.push({
            ...ch,
            seriesTitle: ch.seriesTitle || series.title
          });
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
      const pagesData = apiData.Data ?? [];
      return pagesData.map(mapPageDtoToEntity);
    },
    enabled: !!chapterId,
    staleTime: 1000 * 60,
    retry: 1,
  });
};