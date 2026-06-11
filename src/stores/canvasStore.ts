import { create } from 'zustand';

import type { AnnotationType } from '../types/entities';

// ─── Canvas Tool Types ───────────────────────────────────────

export type CanvasTool = 'select' | 'region' | 'freeform' | 'annotate' | 'pan';

// ─── State ───────────────────────────────────────────────────

interface CanvasState {
  activeTool: CanvasTool;
  zoomLevel: number;
  selectedRegionId: string | null;
  selectedAnnotationId: string | null;
  isDrawing: boolean;
  annotationType: AnnotationType;
}

// ─── Actions ─────────────────────────────────────────────────

interface CanvasActions {
  setActiveTool: (tool: CanvasTool) => void;
  setZoomLevel: (zoom: number) => void;
  setSelectedRegion: (regionId: string | null) => void;
  setSelectedAnnotation: (annotationId: string | null) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setAnnotationType: (type: AnnotationType) => void;
  resetCanvas: () => void;
}

type CanvasStore = CanvasState & CanvasActions;

// ─── Initial State ───────────────────────────────────────────

const initialState: CanvasState = {
  activeTool: 'select',
  zoomLevel: 1,
  selectedRegionId: null,
  selectedAnnotationId: null,
  isDrawing: false,
  annotationType: 'Technical',
};

// ─── Store ───────────────────────────────────────────────────

export const useCanvasStore = create<CanvasStore>()((set) => ({
  ...initialState,

  setActiveTool: (tool) => set({ activeTool: tool, isDrawing: false }),

  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.1, Math.min(5, zoom)) }),

  setSelectedRegion: (regionId) =>
    set({ selectedRegionId: regionId, selectedAnnotationId: null }),

  setSelectedAnnotation: (annotationId) =>
    set({ selectedAnnotationId: annotationId, selectedRegionId: null }),

  setIsDrawing: (isDrawing) => set({ isDrawing }),

  setAnnotationType: (type) => set({ annotationType: type }),

  resetCanvas: () => set(initialState),
}));
