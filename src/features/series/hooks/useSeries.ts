import { useQuery } from '@tanstack/react-query';
import { seriesApi } from '../api/series.api';
import type { Series, Chapter, Page, SeriesStatus } from '../../../types/entities';
import { components } from '../../../api/generated/schema';

import type { ApiResponse, SeriesDto, PageDto, PagedResult } from '../../../api/generated/types';
import { getPagedItems, isApiSuccess } from '../../../api/apiResponse';

// ─── Mapper ──────────────────────────────────────────────────
const mapSeriesStatus = (status: unknown): SeriesStatus => {
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

export const mapPageStatus = (status: unknown): Page['status'] => {
  if (status === 0 || status === '0') return 'Pending';
  if (status === 1 || status === '1') return 'InProgress';
  if (status === 2 || status === '2') return 'NeedsRevision';
  if (status === 3 || status === '3') return 'Completed';
  return (status as Page['status']) || 'Pending';
};

export const mapPageDtoToEntity = (dto: PageDto): Page => ({
  id: dto.id?.toString() || '',
  chapterId: dto.chapterId?.toString() || '',
  pageNumber: dto.pageNumber || 1,
  imageUrl: dto.rawImageUrl || dto.compositeImageUrl || '',
  status: mapPageStatus(dto.status),
  regionCount: 0,
  createdAt: dto.createAt || new Date().toISOString(),
  updatedAt: dto.updateAt || new Date().toISOString(),
});

// ─── Series List ─────────────────────────────────────────────
export const useSeriesList = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery<Series[], Error>({
    queryKey: ['series', params],
    queryFn: async () => {
      const res = await seriesApi.getAll(params);
      const apiData = res.data as ApiResponse<components['schemas']['SeriesDto'][] | PagedResult<components['schemas']['SeriesDto']>>;
      const dtoArray = getPagedItems<components['schemas']['SeriesDto']>(apiData.data);
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
      const apiData = res.data as ApiResponse<components['schemas']['SeriesDto']>;
      const data = apiData.data;
      if (!isApiSuccess(apiData) || !data) return null;
      return mapSeriesDtoToEntity(data);
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
      const apiData = res.data as ApiResponse<components['schemas']['SeriesDto'][] | PagedResult<components['schemas']['SeriesDto']>>;
      const dtoArray = getPagedItems<components['schemas']['SeriesDto']>(apiData.data);
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
      const apiData = res.data as ApiResponse<Chapter[] | PagedResult<Chapter>>;
      return getPagedItems(apiData.data) as Chapter[];
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
      const resData = seriesRes.data as ApiResponse<SeriesDto[] | PagedResult<SeriesDto>>;
      const seriesData = getPagedItems<SeriesDto>(resData.data);

      const allChapters: (Chapter & { seriesTitle: string })[] = [];
      for (const series of seriesData) {
        if (!series.id) continue;
        const chapRes = await seriesApi.getChapters(series.id.toString(), { pageSize: 100 });
        const chapResData = chapRes.data as ApiResponse<Chapter[] | PagedResult<Chapter>>;
        const chapData = getPagedItems(chapResData.data) as Chapter[];

        for (const ch of chapData) {
          allChapters.push({
            ...ch,
            seriesTitle: ch.seriesTitle || series.title || '',
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
      const apiData = res.data as ApiResponse<Chapter & { seriesTitle: string }>;
      if (!isApiSuccess(apiData)) return null;
      return apiData.data ?? null;
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
      const apiData = res.data as ApiResponse<PageDto[]>;
      if (!isApiSuccess(apiData)) return [];
      return (apiData.data ?? []).map(mapPageDtoToEntity);
    },
    enabled: !!chapterId,
    staleTime: 1000 * 60,
    retry: 1,
  });
};