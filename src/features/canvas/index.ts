// ─── Canvas Feature Barrel ────────────────────────────────────

// Components
export { PageCanvasFeature } from './components/PageCanvasFeature';
export { AnnotationReviewFeature } from './components/AnnotationReviewFeature';

// Hooks
export {
  useCanvasPages,
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

// Utils
export { sceneRectToImagePixels } from './utils/canvas.utils';
