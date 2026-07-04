import { useQuery } from '@tanstack/react-query';
import { seriesApi } from '../api/series.api';
import type { ApiResponse, SeriesDto, PageDto, ChapterDto, PagedResult } from '../../../api/generated/types';
import type { ChapterStatus, PageStatus, SeriesStatus } from '../../../types/status.types';
import { getPagedItems, isApiSuccess } from '../../../api/apiResponse';
import { parseApiDate } from '../../../utils/parseApiDate';
import { normalizeSeriesStatus, normalizeChapterStatus, normalizePageStatus } from '../../../utils/status';

export type NormalizedSeriesDto = SeriesDto & { status: SeriesStatus };
export type NormalizedChapterDto = ChapterDto & { status: ChapterStatus };
export type NormalizedPageDto = PageDto & { status: PageStatus };
export type ChapterWithSeriesTitle = NormalizedChapterDto & { seriesTitle: string };

export const normalizeSeriesDto = (dto: SeriesDto): NormalizedSeriesDto => ({
  ...dto,
  status: normalizeSeriesStatus(dto.status),
});

export const normalizeChapterDto = (
  dto: ChapterDto,
  seriesTitle = '',
): ChapterWithSeriesTitle => ({
  ...dto,
  status: normalizeChapterStatus(dto.status),
  seriesTitle,
});

export const normalizePageDto = (dto: PageDto): NormalizedPageDto => ({
  ...dto,
  status: normalizePageStatus(dto.status),
});

export const formatChapterDate = (chapter: ChapterDto): string => {
  const raw = chapter.updateAt || chapter.createAt;
  const parsed = parseApiDate(raw ?? '');
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('vi-VN');
};

export { normalizePageStatus as mapPageStatus } from '../../../utils/status';

// ─── Series List ─────────────────────────────────────────────
export const useSeriesList = (params?: { page?: number; pageSize?: number; status?: string }) => {
  return useQuery<NormalizedSeriesDto[], Error>({
    queryKey: ['series', params],
    queryFn: async () => {
      const res = await seriesApi.getAll(params);
      const apiData = res.data as ApiResponse<SeriesDto[] | PagedResult<SeriesDto>>;
      const dtoArray = getPagedItems<SeriesDto>(apiData.data);
      return dtoArray.map(normalizeSeriesDto);
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

// ─── Series Detail ───────────────────────────────────────────
export const useSeriesDetail = (id?: string) => {
  return useQuery<NormalizedSeriesDto | null, Error>({
    queryKey: ['series', id],
    queryFn: async () => {
      const res = await seriesApi.getById(id as string);
      const apiData = res.data as ApiResponse<SeriesDto>;
      const data = apiData.data;
      if (!isApiSuccess(apiData) || !data) return null;
      return normalizeSeriesDto(data);
    },
    enabled: !!id,
    retry: 1,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'PendingApproval' || status === 'PendingBoardVote') {
        return 15_000;
      }
      return false;
    },
  });
};

// ─── My Series (Mangaka) ─────────────────────────────────────
export const useMySeries = (params?: { page?: number; pageSize?: number }) => {
  return useQuery<NormalizedSeriesDto[], Error>({
    queryKey: ['series', 'my', params],
    queryFn: async () => {
      const res = await seriesApi.getMySeries(params);
      const apiData = res.data as ApiResponse<SeriesDto[] | PagedResult<SeriesDto>>;
      const dtoArray = getPagedItems<SeriesDto>(apiData.data);
      return dtoArray.map(normalizeSeriesDto);
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

// ─── Chapters for Series ─────────────────────────────────────
export const useChapters = (seriesId?: string, params?: { page?: number; pageSize?: number }) => {
  return useQuery<NormalizedChapterDto[], Error>({
    queryKey: ['chapters', seriesId, params],
    queryFn: async () => {
      const res = await seriesApi.getChapters(seriesId as string, params);
      const apiData = res.data as ApiResponse<ChapterDto[] | PagedResult<ChapterDto>>;
      const dtoList = getPagedItems(apiData.data);
      return dtoList.map((dto) => normalizeChapterDto(dto as ChapterDto));
    },
    enabled: !!seriesId,
    staleTime: 1000 * 60,
    retry: 1,
  });
};

// ─── All Chapters (across all series — for Manuscripts) ──────
export const useAllChapters = () => {
  return useQuery<ChapterWithSeriesTitle[], Error>({
    queryKey: ['chapters', 'all'],
    queryFn: async () => {
      const seriesRes = await seriesApi.getMySeries({ pageSize: 100 });
      const resData = seriesRes.data as ApiResponse<SeriesDto[] | PagedResult<SeriesDto>>;
      const seriesData = getPagedItems<SeriesDto>(resData.data);

      const allChapters: ChapterWithSeriesTitle[] = [];
      for (const series of seriesData) {
        if (!series.id) continue;
        const chapRes = await seriesApi.getChapters(series.id.toString(), { pageSize: 100 });
        const chapResData = chapRes.data as ApiResponse<ChapterDto[] | PagedResult<ChapterDto>>;
        const chapData = getPagedItems(chapResData.data);

        for (const dto of chapData) {
          allChapters.push(normalizeChapterDto(dto as ChapterDto, series.title || ''));
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
  return useQuery<ChapterWithSeriesTitle | null, Error>({
    queryKey: ['chapter', chapterId],
    queryFn: async () => {
      const res = await seriesApi.getChapterById(chapterId as string);
      const apiData = res.data as ApiResponse<ChapterDto>;
      if (!isApiSuccess(apiData) || !apiData.data) return null;
      return normalizeChapterDto(apiData.data);
    },
    enabled: !!chapterId,
    retry: 1,
  });
};

// ─── Pages for Chapter ───────────────────────────────────────
export const useChapterPages = (chapterId?: string) => {
  return useQuery<NormalizedPageDto[], Error>({
    queryKey: ['pages', chapterId],
    queryFn: async () => {
      const res = await seriesApi.getPages(chapterId as string);
      const apiData = res.data as ApiResponse<PageDto[]>;
      if (!isApiSuccess(apiData)) return [];
      return (apiData.data ?? []).map(normalizePageDto);
    },
    enabled: !!chapterId,
    staleTime: 1000 * 60,
    retry: 1,
  });
};
