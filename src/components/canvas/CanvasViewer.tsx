import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Canvas, FabricImage, Rect, Circle, Point } from 'fabric';
import { Loader2 } from 'lucide-react';
import type { Region, Annotation, AnnotationType } from '../../types/entities';

// ─── Constants ───────────────────────────────────────────────

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 5;
const ZOOM_STEP = 0.999;

const ANNOTATION_RADIUS = 8;
const ANNOTATION_COLORS: Record<AnnotationType, string> = {
  Technical: '#EF4444',
  Art: '#EAB308',
  Content: '#3B82F6',
};

const REGION_FILL = 'rgba(59, 130, 246, 0.15)';
const REGION_STROKE = '#3B82F6';
const REGION_SELECTED_STROKE = '#2563EB';

// ─── Types ───────────────────────────────────────────────────

export interface CanvasViewerProps {
  imageUrl: string;
  regions?: Region[];
  annotations?: Annotation[];
  mode?: 'view' | 'region' | 'annotate' | 'freeform';
  onRegionCreated?: (region: Omit<Region, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onRegionUpdated?: (region: Region) => void;
  onRegionDeleted?: (regionId: string) => void;
  onAnnotationCreated?: (annotation: { x: number; y: number; type: AnnotationType; comment: string }) => void;
  onAnnotationDeleted?: (annotationId: string) => void;
  selectedRegionId?: string | null;
  selectedAnnotationId?: string | null;
  onAnnotationSelect?: (annotationId: string | null) => void;
  onZoomChange?: (zoom: number) => void;
  className?: string;
}

export interface CanvasViewerHandle {
  getCanvas: () => Canvas | null;
  resetView: () => void;
}

// ─── Component ───────────────────────────────────────────────

export const CanvasViewer = forwardRef<CanvasViewerHandle, CanvasViewerProps>(
  (
    {
      imageUrl,
      regions = [],
      annotations = [],
      mode = 'view',
      onRegionCreated,
      onRegionUpdated,
      onRegionDeleted,
      onAnnotationCreated,
      onAnnotationDeleted,
      selectedRegionId,
      selectedAnnotationId,
      onRegionSelect,
      onAnnotationSelect,
      onZoomChange,
      className,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const imageRef = useRef<FabricImage | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Panning state refs (to avoid stale closures in event handlers)
    const isPanningRef = useRef(false);
    const lastPanPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Region-drawing state refs
    const isDrawingRef = useRef(false);
    const drawOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const drawRectRef = useRef<Rect | null>(null);

    // ── Expose handle via forwardRef ──

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,
      resetView: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
        fitImageToCanvas(canvas);
        canvas.renderAll();
      },
    }));

    // ── Fit image to canvas ──

    const fitImageToCanvas = useCallback((canvas: Canvas) => {
      const img = imageRef.current;
      if (!img) return;

      const cw = canvas.getWidth();
      const ch = canvas.getHeight();
      const iw = img.width ?? 1;
      const ih = img.height ?? 1;

      const scale = Math.min(cw / iw, ch / ih, 1);
      canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
      canvas.zoomToPoint(new Point(0, 0), scale);

      // Center the image
      const scaledW = iw * scale;
      const scaledH = ih * scale;
      const offsetX = (cw - scaledW) / 2;
      const offsetY = (ch - scaledH) / 2;
      const vpt = canvas.viewportTransform;
      if (vpt) {
        vpt[4] = offsetX;
        vpt[5] = offsetY;
        canvas.setViewportTransform(vpt);
      }
    }, []);

    // ── Initialize Fabric Canvas ──

    useEffect(() => {
      const canvasEl = canvasElRef.current;
      const container = containerRef.current;
      if (!canvasEl || !container) return;

      const { width, height } = container.getBoundingClientRect();
      const canvas = new Canvas(canvasEl, {
        width,
        height,
        selection: false,
        renderOnAddRemove: true,
      });

      fabricRef.current = canvas;

      return () => {
        canvas.dispose();
        fabricRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Load image ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas || !imageUrl) return;

      let cancelled = false;
      setIsLoading(true);
      setLoadError(null);

      (async () => {
        try {
          const img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
          if (cancelled) return;

          img.selectable = false;
          img.evented = false;
          imageRef.current = img;

          canvas.backgroundImage = img;
          fitImageToCanvas(canvas);
          canvas.renderAll();
          setIsLoading(false);
        } catch {
          if (!cancelled) {
            setLoadError('Failed to load the manga page image.');
            setIsLoading(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [imageUrl, fitImageToCanvas]);

    // ── Mouse-wheel zoom ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const handleWheel = (opt: { e: WheelEvent }) => {
        const evt = opt.e;
        evt.preventDefault();
        evt.stopPropagation();

        const delta = evt.deltaY;
        let zoom = canvas.getZoom();
        zoom *= ZOOM_STEP ** delta;
        zoom = Math.min(Math.max(zoom, ZOOM_MIN), ZOOM_MAX);

        canvas.zoomToPoint(new Point(evt.offsetX, evt.offsetY), zoom);
        canvas.renderAll();
        if (onZoomChange) onZoomChange(zoom);
      };

      canvas.on('mouse:wheel', handleWheel);
      return () => {
        canvas.off('mouse:wheel', handleWheel);
      };
    }, []);

    // ── Pan / Region-draw / Annotate handlers ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const handleMouseDown = (opt: { e: MouseEvent }) => {
        const evt = opt.e;

        // Alt+drag → panning (in any mode)
        if (evt.altKey) {
          isPanningRef.current = true;
          lastPanPointRef.current = { x: evt.clientX, y: evt.clientY };
          canvas.selection = false;
          return;
        }

        // Region draw mode
        if (mode === 'region') {
          // If clicking on an existing region, let the selection event handle it instead of drawing a new one
          if (opt.target && (opt.target as any)._regionId) return;

          const pointer = canvas.getScenePoint(evt);
          isDrawingRef.current = true;
          drawOriginRef.current = { x: pointer.x, y: pointer.y };

          const rect = new Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: REGION_FILL,
            stroke: REGION_STROKE,
            strokeWidth: 2,
            strokeDashArray: [6, 3],
            selectable: false,
            evented: false,
          });

          canvas.add(rect);
          drawRectRef.current = rect;
          return;
        }

        // Annotate mode — single click creates annotation
        if (mode === 'annotate' && onAnnotationCreated) {
          const pointer = canvas.getScenePoint(evt);
          onAnnotationCreated({
            x: Math.round(pointer.x),
            y: Math.round(pointer.y),
            type: 'Technical', // Default; parent can override via UI
            comment: '',
          });
        }
      };

      const handleMouseMove = (opt: { e: MouseEvent }) => {
        const evt = opt.e;

        // Panning
        if (isPanningRef.current) {
          const vpt = canvas.viewportTransform;
          if (vpt) {
            vpt[4] += evt.clientX - lastPanPointRef.current.x;
            vpt[5] += evt.clientY - lastPanPointRef.current.y;
            canvas.setViewportTransform(vpt);
          }
          lastPanPointRef.current = { x: evt.clientX, y: evt.clientY };
          return;
        }

        // Region drawing
        if (isDrawingRef.current && drawRectRef.current && mode === 'region') {
          const pointer = canvas.getScenePoint(evt);
          const origin = drawOriginRef.current;
          const left = Math.min(origin.x, pointer.x);
          const top = Math.min(origin.y, pointer.y);
          const width = Math.abs(pointer.x - origin.x);
          const height = Math.abs(pointer.y - origin.y);

          drawRectRef.current.set({ left, top, width, height });
          canvas.renderAll();
        }
      };

      const handleMouseUp = () => {
        // End panning
        if (isPanningRef.current) {
          isPanningRef.current = false;
          return;
        }

        // Finalize region
        if (isDrawingRef.current && drawRectRef.current && mode === 'region') {
          const rect = drawRectRef.current;
          const w = rect.width ?? 0;
          const h = rect.height ?? 0;

          // Only create if region is large enough (avoid accidental clicks)
          if (w > 5 && h > 5 && onRegionCreated) {
            onRegionCreated({
              pageId: '',
              x: Math.round(rect.left ?? 0),
              y: Math.round(rect.top ?? 0),
              width: Math.round(w),
              height: Math.round(h),
            });
          }

          // Remove the temporary drawing rect; persistent regions are rendered separately
          canvas.remove(rect);
          canvas.renderAll();

          isDrawingRef.current = false;
          drawRectRef.current = null;
        }
      };

      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);

      return () => {
        canvas.off('mouse:down', handleMouseDown);
        canvas.off('mouse:move', handleMouseMove);
        canvas.off('mouse:up', handleMouseUp);
      };
    }, [mode, onRegionCreated, onAnnotationCreated]);

    // ── Freeform drawing mode ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      if (mode === 'freeform') {
        canvas.isDrawingMode = true;
        // Ensure freeDrawingBrush is initialized (it should be by default when isDrawingMode = true)
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = REGION_STROKE;
          canvas.freeDrawingBrush.width = 3;
        }

        const handlePathCreated = (opt: any) => {
          const path = opt.path;
          const rect = path.getBoundingRect();
          
          if (rect.width > 5 && rect.height > 5 && onRegionCreated) {
            onRegionCreated({
              pageId: '',
              x: Math.round(rect.left),
              y: Math.round(rect.top),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          }
          canvas.remove(path);
          canvas.renderAll();
        };

        canvas.on('path:created', handlePathCreated);
        return () => {
          canvas.off('path:created', handlePathCreated);
          canvas.isDrawingMode = false;
        };
      } else {
        canvas.isDrawingMode = false;
      }
    }, [mode, onRegionCreated]);

    // ── Render regions ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Remove old region objects
      const existing = canvas.getObjects().filter((o) => (o as Rect & { _regionId?: string })._regionId);
      existing.forEach((o) => canvas.remove(o));

      // Add new ones
      regions.forEach((region) => {
        const isSelected = region.id === selectedRegionId;
        const rect = new Rect({
          left: region.x,
          top: region.y,
          width: region.width,
          height: region.height,
          fill: REGION_FILL,
          stroke: isSelected ? REGION_SELECTED_STROKE : REGION_STROKE,
          strokeWidth: isSelected ? 3 : 2,
          strokeDashArray: [6, 3],
          selectable: mode === 'region',
          evented: true,
          hasControls: mode === 'region',
          hasBorders: mode === 'region',
          lockRotation: true,
        });

        // Tag for identification
        (rect as Rect & { _regionId: string })._regionId = region.id;

        // Click handler for selection
        rect.on('mousedown', () => {
          onRegionSelect?.(region.id);
        });

        // Modify handler for updates
        rect.on('modified', () => {
          if (onRegionUpdated) {
            onRegionUpdated({
              ...region,
              x: Math.round(rect.left ?? region.x),
              y: Math.round(rect.top ?? region.y),
              width: Math.round((rect.width ?? region.width) * (rect.scaleX ?? 1)),
              height: Math.round((rect.height ?? region.height) * (rect.scaleY ?? 1)),
            });
            // Reset scale after applying
            rect.set({ scaleX: 1, scaleY: 1 });
          }
        });

        canvas.add(rect);
      });

      canvas.renderAll();
    }, [regions, selectedRegionId, mode, onRegionSelect, onRegionUpdated]);

    // ── Render annotations ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Remove old annotation objects
      const existing = canvas.getObjects().filter((o) => (o as Circle & { _annotationId?: string })._annotationId);
      existing.forEach((o) => canvas.remove(o));

      // Add new ones
      annotations.forEach((annotation) => {
        const isSelected = annotation.id === selectedAnnotationId;
        const color = ANNOTATION_COLORS[annotation.type];

        const circle = new Circle({
          left: annotation.x - ANNOTATION_RADIUS,
          top: annotation.y - ANNOTATION_RADIUS,
          radius: ANNOTATION_RADIUS,
          fill: color,
          stroke: isSelected ? '#FFFFFF' : color,
          strokeWidth: isSelected ? 3 : 1.5,
          selectable: false,
          evented: true,
          shadow: isSelected
            ? { color: 'rgba(0,0,0,0.4)', blur: 8, offsetX: 0, offsetY: 2 }
            : undefined,
        });

        // Tag for identification
        (circle as Circle & { _annotationId: string })._annotationId = annotation.id;

        // Click handler for selection
        circle.on('mousedown', () => {
          onAnnotationSelect?.(annotation.id);
        });

        canvas.add(circle);
      });

      canvas.renderAll();
    }, [annotations, selectedAnnotationId, onAnnotationSelect]);

    // ── ResizeObserver ──

    useEffect(() => {
      const container = containerRef.current;
      const canvas = fabricRef.current;
      if (!container || !canvas) return;

      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;

        const { width, height } = entry.contentRect;
        canvas.setDimensions({ width, height });
        fitImageToCanvas(canvas);
        canvas.renderAll();
      });

      observer.observe(container);
      return () => observer.disconnect();
    }, [fitImageToCanvas]);

    // ── Cursor style based on mode ──

    const cursorClass =
      mode === 'region'
        ? 'cursor-crosshair'
        : mode === 'freeform'
          ? 'cursor-crosshair'
          : mode === 'annotate'
            ? 'cursor-cell'
            : 'cursor-grab';

    // ── Render ──

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden bg-bg-primary border border-border-custom rounded-xl ${cursorClass} ${className ?? ''}`}
      >
        <canvas ref={canvasElRef} />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-brand animate-spin" />
              <span className="text-sm text-text-secondary">Loading page…</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/90 z-10">
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <span className="text-danger text-sm font-medium">{loadError}</span>
              <span className="text-text-muted text-xs">Check the image URL and try again.</span>
            </div>
          </div>
        )}

        {/* Mode indicator badge */}
        {mode !== 'view' && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-bg-surface/90 border border-border-custom backdrop-blur-sm">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              {mode === 'region' ? '⬜ Region Select' : mode === 'freeform' ? '✏️ Freeform Draw' : '📌 Annotate'}
            </span>
          </div>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 z-10 px-2 py-1 rounded bg-bg-surface/70 backdrop-blur-sm">
          <span className="text-[10px] text-text-muted">
            Scroll to zoom · Alt+drag to pan
          </span>
        </div>
      </div>
    );
  },
);

CanvasViewer.displayName = 'CanvasViewer';
