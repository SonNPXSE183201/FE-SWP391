// ─── Canvas Feature Barrel ────────────────────────────────────

// Components
export { PageCanvasFeature } from './components/PageCanvasFeature';
export { AnnotationReviewFeature } from './components/AnnotationReviewFeature';

// Hooks
export {
  useCanvasPages,
  useCanvasPage,
  useRegions,
  useCreateRegion,
  useUpdateRegion,
  useDeleteRegion,
  useAnnotations,
  useCreateAnnotation,
  useDeleteAnnotation,
  useMarkPageReady,
} from './hooks/useCanvasData';

// API
export { canvasApi } from './api/canvas.api';

// Mock Data
export {
  MOCK_CANVAS_PAGES,
  MOCK_REGIONS,
  MOCK_ANNOTATIONS,
  getRegionsByPageId,
  getAnnotationsByPageId,
} from './data/mockData';
