import { axiosInstance } from '../../../api/axios';
import type { Annotation, Region, AnnotationType } from '../../../types/entities';
import {
  MOCK_CANVAS_PAGES,
  MOCK_REGIONS,
  MOCK_ANNOTATIONS,
  getRegionsByPageId,
  getAnnotationsByPageId,
} from '../data/mockData';

// ─── Toggle to false when backend canvas API is ready ────────
const USE_MOCK = true;

const mockDelay = (ms = 50) => new Promise((r) => setTimeout(r, ms));

const mockResponse = <T>(data: T, message = 'Success') => ({
  data: { IsSuccess: true, success: true, Message: message, Data: data },
});

// ─── Canvas API ──────────────────────────────────────────────
// Note: When USE_MOCK is off, the return types will be from the
// OpenAPI schema (PascalCase). The hook's select() must adapt.
// For now, all consumers use entities.ts camelCase types via mock data.
export const canvasApi = {
  // ─── Pages ───
  getPagesByChapterId: async (chapterId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse(MOCK_CANVAS_PAGES.filter((p) => p.chapterId === chapterId));
    }
    return axiosInstance.get<any>(`/api/pages/chapter/${chapterId}`);
  },

  getPageById: async (pageId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      const page = MOCK_CANVAS_PAGES.find((p) => p.id === pageId);
      return mockResponse(page || null);
    }
    return axiosInstance.get<any>(`/api/pages/${pageId}`);
  },

  // ─── Regions ───
  getRegionsByPageId: async (pageId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse(getRegionsByPageId(pageId));
    }
    return axiosInstance.get<any>(`/api/pages/${pageId}/regions`);
  },

  createRegion: async (data: { pageId: string; x: number; y: number; width: number; height: number; label?: string }) => {
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
    return axiosInstance.post<any>('/api/regions', data);
  },

  updateRegion: async (regionId: string, data: Partial<Region>) => {
    if (USE_MOCK) {
      await mockDelay(300);
      const idx = MOCK_REGIONS.findIndex((r) => r.id === regionId);
      if (idx >= 0) Object.assign(MOCK_REGIONS[idx], data, { updatedAt: new Date().toISOString() });
      return mockResponse(MOCK_REGIONS[idx] || null, 'Region đã được cập nhật');
    }
    return axiosInstance.put<any>(`/api/regions/${regionId}`, data);
  },

  deleteRegion: async (regionId: string) => {
    if (USE_MOCK) {
      await mockDelay(300);
      const idx = MOCK_REGIONS.findIndex((r) => r.id === regionId);
      if (idx >= 0) MOCK_REGIONS.splice(idx, 1);
      return mockResponse(true, 'Region đã được xoá');
    }
    return axiosInstance.delete<any>(`/api/regions/${regionId}`);
  },

  // ─── Annotations ───
  getAnnotationsByPageId: async (pageId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse(getAnnotationsByPageId(pageId));
    }
    return axiosInstance.get<any>(`/api/pages/${pageId}/annotations`);
  },

  createAnnotation: async (data: { pageId: string; x: number; y: number; type: AnnotationType; comment: string }) => {
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
    return axiosInstance.post<any>('/api/annotations', data);
  },

  deleteAnnotation: async (annotationId: string) => {
    if (USE_MOCK) {
      await mockDelay(300);
      const idx = MOCK_ANNOTATIONS.findIndex((a) => a.id === annotationId);
      if (idx >= 0) MOCK_ANNOTATIONS.splice(idx, 1);
      return mockResponse(true, 'Annotation đã được xoá');
    }
    return axiosInstance.delete<any>(`/api/annotations/${annotationId}`);
  },

  toggleAnnotationResolved: async (annotationId: string) => {
    if (USE_MOCK) {
      await mockDelay(300);
      const anno = MOCK_ANNOTATIONS.find((a) => a.id === annotationId);
      if (anno) {
        anno.resolved = !anno.resolved;
        anno.updatedAt = new Date().toISOString();
      }
      return mockResponse(anno || null, anno?.resolved ? 'Đã đánh dấu giải quyết' : 'Đã mở lại');
    }
    return axiosInstance.patch<any>(`/api/annotations/${annotationId}/toggle-resolved`);
  },
};
