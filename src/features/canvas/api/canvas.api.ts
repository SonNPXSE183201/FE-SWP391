import { axiosInstance } from '../../../api/axios';
import { createMockApiResponse } from '../../../api/apiResponse';
import type {
  AnnotationDtoApiResponse,
  AnnotationDtoIEnumerableApiResponse,
  RegionDtoApiResponse,
  RegionDtoIEnumerableApiResponse,
} from '../../../api/generated/types';
import type { Annotation, Region, AnnotationType } from '../../../types/entities';
import { seriesApi } from '../../series/api/series.api';
import {
  MOCK_CANVAS_PAGES,
  MOCK_REGIONS,
  MOCK_ANNOTATIONS,
  getRegionsByPageId,
  getAnnotationsByPageId,
} from '../data/mockData';
import {
  toCreateAnnotationDto,
  toCreateRegionDto,
  toUpdateRegionDto,
} from '../utils/canvas.utils';

const USE_MOCK = false;

const mockDelay = (ms = 50) => new Promise((r) => setTimeout(r, ms));
const mockResponse = createMockApiResponse;

export const canvasApi = {
  getPagesByChapterId: async (chapterId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse(MOCK_CANVAS_PAGES.filter((p) => p.chapterId === chapterId));
    }
    return seriesApi.getPages(chapterId);
  },

  getPageById: async (pageId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      const page = MOCK_CANVAS_PAGES.find((p) => p.id === pageId);
      return mockResponse(page || null);
    }
    return Promise.reject(new Error('GET /api/pages/{id} không tồn tại — dùng GET /api/chapters/{chapterId}/pages'));
  },

  getRegionsByPageId: async (pageId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse(getRegionsByPageId(pageId));
    }
    return axiosInstance.get<RegionDtoIEnumerableApiResponse>(`/api/pages/${pageId}/regions`);
  },

  createRegion: async (data: {
    pageId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
  }) => {
    if (USE_MOCK) {
      await mockDelay(500);
      const newRegion: Region = {
        id: `region-${Date.now()}`,
        pageId: data.pageId,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        label: data.label,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_REGIONS.push(newRegion);
      return mockResponse(newRegion, 'Region đã được tạo thành công');
    }
    return axiosInstance.post<RegionDtoApiResponse>('/api/regions', toCreateRegionDto(data));
  },

  updateRegion: async (regionId: string, data: Partial<Region>) => {
    if (USE_MOCK) {
      await mockDelay(300);
      const idx = MOCK_REGIONS.findIndex((r) => r.id === regionId);
      if (idx >= 0) Object.assign(MOCK_REGIONS[idx], data, { updatedAt: new Date().toISOString() });
      return mockResponse(MOCK_REGIONS[idx] || null, 'Region đã được cập nhật');
    }
    return axiosInstance.put<RegionDtoApiResponse>(`/api/regions/${regionId}`, toUpdateRegionDto(data));
  },

  deleteRegion: async (regionId: string) => {
    if (USE_MOCK) {
      await mockDelay(300);
      const idx = MOCK_REGIONS.findIndex((r) => r.id === regionId);
      if (idx >= 0) MOCK_REGIONS.splice(idx, 1);
      return mockResponse(true, 'Region đã được xoá');
    }
    return axiosInstance.delete(`/api/regions/${regionId}`);
  },

  getAnnotationsByPageId: async (pageId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse(getAnnotationsByPageId(pageId));
    }
    return axiosInstance.get<AnnotationDtoIEnumerableApiResponse>('/api/annotations', {
      params: { pageId },
    });
  },

  createAnnotation: async (data: {
    pageId: string;
    x: number;
    y: number;
    type: AnnotationType;
    comment: string;
  }) => {
    if (USE_MOCK) {
      await mockDelay(500);
      const newAnno: Annotation = {
        id: `anno-${Date.now()}`,
        pageId: data.pageId,
        editorId: 'editor-1',
        editorName: 'Current Editor',
        type: data.type,
        x: data.x,
        y: data.y,
        comment: data.comment,
        resolved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_ANNOTATIONS.push(newAnno);
      return mockResponse(newAnno, 'Annotation đã được tạo');
    }
    return axiosInstance.post<AnnotationDtoApiResponse>('/api/annotations', toCreateAnnotationDto(data));
  },

  deleteAnnotation: async (annotationId: string) => {
    if (USE_MOCK) {
      await mockDelay(300);
      const idx = MOCK_ANNOTATIONS.findIndex((a) => a.id === annotationId);
      if (idx >= 0) MOCK_ANNOTATIONS.splice(idx, 1);
      return mockResponse(true, 'Annotation đã được xoá');
    }
    return axiosInstance.delete(`/api/annotations/${annotationId}`);
  },
};
