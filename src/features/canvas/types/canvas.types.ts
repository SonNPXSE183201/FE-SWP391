import type { AnnotationType, PageStatus } from '../../../types/status.types';

/** Parsed page shape for canvas viewer (URLs resolved, string IDs). */
export interface CanvasPage {
  id: string;
  chapterId: string;
  pageNumber: number;
  imageUrl: string;
  compositeImageUrl?: string;
  status: PageStatus;
  regionCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Region with parsed coordinates from coordinatesJson. */
export interface CanvasRegion {
  id: string;
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  taskId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Annotation with parsed pin coordinates for canvas overlay. */
export interface CanvasAnnotation {
  id: string;
  pageId: string;
  regionId?: string;
  editorId: string;
  editorName: string;
  type: AnnotationType;
  x: number;
  y: number;
  comment: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}
