import { axiosInstance } from '../../../api/axios';
import type {
  AnnotationDtoApiResponse,
  AnnotationDtoIEnumerableApiResponse,
  RegionDtoApiResponse,
  RegionDtoIEnumerableApiResponse,
} from '../../../api/generated/types';
import type { AnnotationType } from '../../../types/status.types';
import type { CanvasRegion } from '../types/canvas.types';
import { seriesApi } from '../../series/api/series.api';
import {
  toCreateAnnotationDto,
  toCreateRegionDto,
  toUpdateRegionDto,
} from '../utils/canvas.utils';

export const canvasApi = {
  getPagesByChapterId: async (chapterId: string) => seriesApi.getPages(chapterId),

  getRegionsByPageId: async (pageId: string) =>
    axiosInstance.get<RegionDtoIEnumerableApiResponse>(`/api/pages/${pageId}/regions`),

  createRegion: async (data: {
    pageId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
  }) => axiosInstance.post<RegionDtoApiResponse>('/api/regions', toCreateRegionDto(data)),

  updateRegion: async (regionId: string, data: Partial<CanvasRegion>) =>
    axiosInstance.put<RegionDtoApiResponse>(`/api/regions/${regionId}`, toUpdateRegionDto(data)),

  deleteRegion: async (regionId: string) => axiosInstance.delete(`/api/regions/${regionId}`),

  getAnnotationsByPageId: async (pageId: string) =>
    axiosInstance.get<AnnotationDtoIEnumerableApiResponse>('/api/annotations', {
      params: { pageId },
    }),

  createAnnotation: async (data: {
    pageId: string;
    x: number;
    y: number;
    type: AnnotationType;
    comment: string;
  }) => axiosInstance.post<AnnotationDtoApiResponse>('/api/annotations', toCreateAnnotationDto(data)),

  deleteAnnotation: async (annotationId: string) =>
    axiosInstance.delete(`/api/annotations/${annotationId}`),

  markPageReady: (pageId: string) => seriesApi.markPageReady(pageId),

  unmarkPageReady: (pageId: string) => seriesApi.unmarkPageReady(pageId),
};
