import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { canvasApi } from '../api/canvas.api';
import type { AnnotationDto, PageDto, RegionDto } from '../../../api/generated/types';
import type { AnnotationType } from '../../../types/status.types';
import type { CanvasPage, CanvasRegion } from '../types/canvas.types';
import { normalizePageDto } from '../../series/hooks/useSeries';
import { isApiSuccess, getAxiosErrorMessage } from '../../../api/apiResponse';
import type { ApiResponse } from '../../../api/generated/types';
import {
  mapAnnotationDtoToEntity,
  mapRegionDtoToEntity,
} from '../utils/canvas.utils';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';

const KEYS = {
  pages: (chapterId: string) => ['canvas', 'pages', chapterId] as const,
  regions: (pageId: string) => ['canvas', 'regions', pageId] as const,
  annotations: (pageId: string) => ['canvas', 'annotations', pageId] as const,
};

const mapPagesResponse = (res: { data?: { data?: unknown } }): CanvasPage[] => {
  const raw = res.data?.data;
  if (!Array.isArray(raw)) return [];
  if (raw.length > 0 && typeof raw[0] === 'object' && raw[0] !== null && 'pageNumber' in raw[0]) {
    const pages = (raw as PageDto[]).map((dto) => {
      const page = normalizePageDto(dto);
      const v = page.updateAt ? new Date(page.updateAt).getTime() : undefined;

      let rawUrl = resolveMediaUrl(dto.rawImageUrl || '');
      if (rawUrl && v) {
        rawUrl += `${rawUrl.includes('?') ? '&' : '?'}v=${v}`;
      }

      let compositeUrl = dto.compositeImageUrl
        ? resolveMediaUrl(dto.compositeImageUrl)
        : undefined;
      if (compositeUrl && v) {
        compositeUrl += `${compositeUrl.includes('?') ? '&' : '?'}v=${v}`;
      }

      return {
        id: String(page.id ?? ''),
        chapterId: String(page.chapterId ?? ''),
        pageNumber: page.pageNumber ?? 1,
        imageUrl: rawUrl,
        compositeImageUrl: compositeUrl,
        status: page.status,
        regionCount: 0,
        createdAt: page.createAt || new Date().toISOString(),
        updatedAt: page.updateAt || new Date().toISOString(),
      };
    });

    return pages.sort((a, b) => a.pageNumber - b.pageNumber);
  }
  return raw as CanvasPage[];
};

export const useCanvasPages = (chapterId: string) =>
  useQuery({
    queryKey: KEYS.pages(chapterId),
    queryFn: () => canvasApi.getPagesByChapterId(chapterId),
    select: mapPagesResponse,
    enabled: !!chapterId,
  });

export const useRegions = (pageId: string) =>
  useQuery({
    queryKey: KEYS.regions(pageId),
    queryFn: () => canvasApi.getRegionsByPageId(pageId),
    select: (res) => {
      const items = res.data?.data ?? [];
      if (!Array.isArray(items)) return [];
      return (items as RegionDto[]).map(mapRegionDtoToEntity);
    },
    enabled: !!pageId,
  });

export const useCreateRegion = (pageId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { pageId: string; x: number; y: number; width: number; height: number; label?: string }) =>
      canvasApi.createRegion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.regions(pageId) }),
  });
};

export const useUpdateRegion = (pageId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ regionId, data }: { regionId: string; data: Partial<CanvasRegion> }) =>
      canvasApi.updateRegion(regionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.regions(pageId) }),
  });
};

export const useDeleteRegion = (pageId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (regionId: string) => canvasApi.deleteRegion(regionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.regions(pageId) }),
  });
};

export const useAnnotations = (pageId: string) =>
  useQuery({
    queryKey: KEYS.annotations(pageId),
    queryFn: () => canvasApi.getAnnotationsByPageId(pageId),
    select: (res) => {
      const items = res.data?.data ?? [];
      if (!Array.isArray(items)) return [];
      return (items as AnnotationDto[]).map(mapAnnotationDtoToEntity);
    },
    enabled: !!pageId,
  });

export const useCreateAnnotation = (pageId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { pageId: string; x: number; y: number; type: AnnotationType; comment: string }) =>
      canvasApi.createAnnotation(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.annotations(pageId) }),
  });
};

export const useDeleteAnnotation = (pageId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (annotationId: string) => canvasApi.deleteAnnotation(annotationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.annotations(pageId) }),
  });
};

export const useMarkPageReady = (chapterId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pageId: string) => {
      try {
        const res = await canvasApi.markPageReady(pageId);
        const apiData = res.data as ApiResponse<PageDto>;
        if (!isApiSuccess(apiData)) {
          throw new Error(apiData.message || 'Không thể đánh dấu trang');
        }
        return apiData;
      } catch (err) {
        throw new Error(getAxiosErrorMessage(err, 'Không thể đánh dấu trang sẵn sàng'), { cause: err });
      }
    },
    onSuccess: (_data, pageId) => {
      toast.success('Đã đánh dấu trang sẵn sàng — không cần sản xuất thêm');
      void qc.invalidateQueries({ queryKey: KEYS.pages(chapterId) });
      void qc.invalidateQueries({ queryKey: ['pages', chapterId] });
      void qc.invalidateQueries({ queryKey: ['chapter', chapterId] });
      void qc.invalidateQueries({ queryKey: ['chapter', chapterId, 'production-readiness'] });
      void qc.invalidateQueries({ queryKey: KEYS.regions(pageId) });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUnmarkPageReady = (chapterId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pageId: string) => {
      try {
        const res = await canvasApi.unmarkPageReady(pageId);
        return res.data;
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          throw new Error(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý.', { cause: err });
        }
        throw err;
      }
    },
    onSuccess: (_data, pageId) => {
      toast.success('Đã bỏ đánh dấu sẵn sàng');
      void qc.invalidateQueries({ queryKey: KEYS.pages(chapterId) });
      void qc.invalidateQueries({ queryKey: ['pages', chapterId] });
      void qc.invalidateQueries({ queryKey: ['chapter', chapterId] });
      void qc.invalidateQueries({ queryKey: ['chapter', chapterId, 'production-readiness'] });
      void qc.invalidateQueries({ queryKey: KEYS.regions(pageId) });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
