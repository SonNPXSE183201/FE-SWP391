import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { canvasApi } from '../api/canvas.api';
import type { Annotation, AnnotationType, Page, Region } from '../../../types/entities';

// ─── Query Keys ──────────────────────────────────────────────
const KEYS = {
  pages: (chapterId: string) => ['canvas', 'pages', chapterId] as const,
  page: (pageId: string) => ['canvas', 'page', pageId] as const,
  regions: (pageId: string) => ['canvas', 'regions', pageId] as const,
  annotations: (pageId: string) => ['canvas', 'annotations', pageId] as const,
};

// ─── Pages ───────────────────────────────────────────────────
export const useCanvasPages = (chapterId: string) =>
  useQuery({
    queryKey: KEYS.pages(chapterId),
    queryFn: () => canvasApi.getPagesByChapterId(chapterId),
    select: (res) => (res.data?.data ?? []) as Page[],
    enabled: !!chapterId,
  });

export const useCanvasPage = (pageId: string) =>
  useQuery({
    queryKey: KEYS.page(pageId),
    queryFn: () => canvasApi.getPageById(pageId),
    select: (res) => (res.data?.data ?? null) as Page | null,
    enabled: !!pageId,
  });

// ─── Regions ─────────────────────────────────────────────────
export const useRegions = (pageId: string) =>
  useQuery({
    queryKey: KEYS.regions(pageId),
    queryFn: () => canvasApi.getRegionsByPageId(pageId),
    select: (res) => (res.data?.data ?? []) as Region[],
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
    mutationFn: ({ regionId, data }: { regionId: string; data: Record<string, unknown> }) =>
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

// ─── Annotations ─────────────────────────────────────────────
export const useAnnotations = (pageId: string) =>
  useQuery({
    queryKey: KEYS.annotations(pageId),
    queryFn: () => canvasApi.getAnnotationsByPageId(pageId),
    select: (res) => (res.data?.data ?? []) as Annotation[],
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

export const useToggleAnnotationResolved = (pageId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (annotationId: string) => canvasApi.toggleAnnotationResolved(annotationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.annotations(pageId) }),
  });
};
