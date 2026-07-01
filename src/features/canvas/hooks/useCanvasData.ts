import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { canvasApi } from '../api/canvas.api';
import type { AnnotationDto, PageDto, RegionDto } from '../../../api/generated/types';
import type { AnnotationType, Page, Region } from '../../../types/entities';
import { mapPageDtoToEntity } from '../../series/hooks/useSeries';
import { isApiSuccess, getAxiosErrorMessage } from '../../../api/apiResponse';
import type { ApiResponse } from '../../../api/generated/types';
import {
  mapAnnotationDtoToEntity,
  mapRegionDtoToEntity,
  resolvePageImageUrl,
} from '../utils/canvas.utils';

const KEYS = {
  pages: (chapterId: string) => ['canvas', 'pages', chapterId] as const,
  page: (pageId: string) => ['canvas', 'page', pageId] as const,
  regions: (pageId: string) => ['canvas', 'regions', pageId] as const,
  annotations: (pageId: string) => ['canvas', 'annotations', pageId] as const,
};

const mapPagesResponse = (res: { data?: { data?: unknown } }): Page[] => {
  const raw = res.data?.data;
  if (!Array.isArray(raw)) return [];
  if (raw.length > 0 && typeof raw[0] === 'object' && raw[0] !== null && 'pageNumber' in raw[0]) {
    return (raw as PageDto[]).map((dto) => {
      const page = mapPageDtoToEntity(dto);
      const rawUrl = resolvePageImageUrl(page.imageUrl);
      const compositeUrl = page.compositeImageUrl
        ? resolvePageImageUrl(page.compositeImageUrl)
        : undefined;
      return {
        ...page,
        imageUrl: rawUrl,
        compositeImageUrl: compositeUrl,
      };
    });
  }
  return raw as Page[];
};

export const useCanvasPages = (chapterId: string) =>
  useQuery({
    queryKey: KEYS.pages(chapterId),
    queryFn: () => canvasApi.getPagesByChapterId(chapterId),
    select: mapPagesResponse,
    enabled: !!chapterId,
  });

export const useCanvasPage = (pageId: string) =>
  useQuery({
    queryKey: KEYS.page(pageId),
    queryFn: () => canvasApi.getPageById(pageId),
    select: (res) => (res.data?.data ?? null) as Page | null,
    enabled: !!pageId,
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
    mutationFn: ({ regionId, data }: { regionId: string; data: Partial<Region> }) =>
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
        throw new Error(getAxiosErrorMessage(err, 'Không thể đánh dấu trang sẵn sàng'));
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

