import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Canvas,
  FabricImage,
  Rect,
  Circle,
  Point,
  PencilBrush,
  Shadow,
  type FabricObject,
  type TPointerEventInfo,
} from 'fabric';
import { Loader2 } from 'lucide-react';
import type { CanvasRegion, CanvasAnnotation } from '../../features/canvas/types/canvas.types';
import type { AnnotationType } from '../../types/status.types';
import { sceneRectToImagePixels } from '../../features/canvas';

// ─── Constants ───────────────────────────────────────────────

const ZOOM_MIN = 0.05;
const ZOOM_MAX = 8;
/** Mouse-wheel zoom sensitivity (smaller = slower). */
const WHEEL_ZOOM_FACTOR = 0.0015;
/** Padding ratio kept around the page when fitting to the viewport. */
const FIT_PADDING = 0.98;
/** Minimum region size (in image pixels) below which a draw is discarded. */
const MIN_REGION_SIZE = 6;

const ANNOTATION_RADIUS = 9;
const ANNOTATION_COLORS: Record<AnnotationType, string> = {
  Technical: '#FF4757',
  Art: '#FFAA00',
  Content: '#4DABF7',
};

const REGION_FILL = 'rgba(108, 92, 231, 0.14)';
const REGION_STROKE = '#6C5CE7';
const REGION_SELECTED_FILL = 'rgba(108, 92, 231, 0.24)';
const REGION_SELECTED_STROKE = '#7C6EF0';

// ─── Tagged fabric object helpers ────────────────────────────

type TaggedObject = FabricObject & {
  _isMainImage?: boolean;
  _imageFrame?: boolean;
  _regionId?: string;
  _annotationId?: string;
};

type CanvasMode = 'view' | 'region' | 'annotate' | 'freeform' | 'pan';

// ─── Types ───────────────────────────────────────────────────

export interface CanvasViewerProps {
  imageUrl: string;
  regions?: CanvasRegion[];
  annotations?: CanvasAnnotation[];
  mode?: CanvasMode;
  onRegionCreated?: (region: Omit<CanvasRegion, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onRegionUpdated?: (region: CanvasRegion) => void;
  onRegionSelect?: (regionId: string) => void;
  onRegionDeleted?: (regionId: string) => void;
  onAnnotationCreated?: (annotation: { x: number; y: number; type: AnnotationType; comment: string }) => void;
  onAnnotationDeleted?: (annotationId: string) => void;
  selectedRegionId?: string | null;
  selectedAnnotationId?: string | null;
  onAnnotationSelect?: (annotationId: string | null) => void;
  onZoomChange?: (zoom: number) => void;
  /** Báo kích thước pixel thật của ảnh trang sau khi tải xong (để khung bo theo tỉ lệ). */
  onImageLoad?: (size: { width: number; height: number }) => void;
  /** Hiển thị toạ độ trực tiếp (x, y, w×h) khi đang vẽ / kéo / resize region. */
  showRegionCoords?: boolean;
  className?: string;
}

export interface CanvasViewerHandle {
  getCanvas: () => Canvas | null;
  resetView: () => void;
  /** Reset the view so the page fits the frame (presented as 100%). */
  zoomTo100: () => void;
  /** Multiply the current zoom by `factor`, around the viewport centre. */
  zoomBy: (factor: number) => void;
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
      onAnnotationCreated,
      selectedRegionId,
      selectedAnnotationId,
      onRegionSelect,
      onAnnotationSelect,
      onZoomChange,
      onImageLoad,
      showRegionCoords = false,
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

    // Live coordinate readout shown while drawing / dragging / resizing a region
    const [liveCoords, setLiveCoords] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    // Keep the latest mode/handlers in refs so the imperative Fabric event
    // listeners (registered once) always read fresh values without re-binding.
    const modeRef = useRef<CanvasMode>(mode);
    modeRef.current = mode;

    const callbacksRef = useRef({ onRegionCreated, onAnnotationCreated, onRegionSelect, onAnnotationSelect, onZoomChange, onImageLoad, showRegionCoords });
    callbacksRef.current = { onRegionCreated, onAnnotationCreated, onRegionSelect, onAnnotationSelect, onZoomChange, onImageLoad, showRegionCoords };

    // Tracks whether the user has manually zoomed/panned the current image so a
    // container resize doesn't yank the view back to "fit".
    const userAdjustedRef = useRef(false);
    // Ensures we only auto-fit once per loaded image.
    const fittedUrlRef = useRef<string | null>(null);
    // The absolute Fabric scale at which the page exactly fits the viewport.
    // Reported zoom is expressed RELATIVE to this, so "fit" reads as 100%.
    const fitScaleRef = useRef(1);

    // ── Scene/geometry helpers ──

    // The page image is always placed at scene (0,0) with scale 1, so its scene
    // bounds are simply [0,0] → [imgWidth, imgHeight].
    const getImageBounds = useCallback(() => {
      const img = imageRef.current;
      if (!img) return null;
      return { left: 0, top: 0, right: img.width ?? 0, bottom: img.height ?? 0 };
    }, []);

    // Convert a Fabric rect's current scene geometry into original-image pixel coords.
    const rectToImageCoords = useCallback((rect: Rect) => {
      const img = imageRef.current;
      const w = (rect.width ?? 0) * (rect.scaleX ?? 1);
      const h = (rect.height ?? 0) * (rect.scaleY ?? 1);
      if (img) return sceneRectToImagePixels(img, rect.left ?? 0, rect.top ?? 0, w, h);
      return {
        x: Math.round(rect.left ?? 0),
        y: Math.round(rect.top ?? 0),
        width: Math.max(1, Math.round(w)),
        height: Math.max(1, Math.round(h)),
      };
    }, []);

    // `zoom` is the absolute Fabric scale; report it relative to the fit scale
    // so that "page fits the frame" is presented to the user as 100%.
    const emitZoom = useCallback((zoom: number) => {
      const base = fitScaleRef.current > 0 ? fitScaleRef.current : 1;
      callbacksRef.current.onZoomChange?.(zoom / base);
    }, []);

    // ── Fit image to the viewport (centered) ──

    const fitImageToCanvas = useCallback(() => {
      const canvas = fabricRef.current;
      const img = imageRef.current;
      const container = containerRef.current;
      if (!canvas || !img || !container) return false;

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw <= 0 || ch <= 0) return false;

      if (canvas.getWidth() !== cw || canvas.getHeight() !== ch) {
        canvas.setDimensions({ width: cw, height: ch });
      }

      const iw = img.width ?? 1;
      const ih = img.height ?? 1;
      if (iw <= 0 || ih <= 0) return false;

      // Fit-to-screen; never upscale tiny images past 100%.
      const scale = Math.min(cw / iw, ch / ih, 1) * FIT_PADDING;
      const tx = (cw - iw * scale) / 2;
      const ty = (ch - ih * scale) / 2;

      fitScaleRef.current = scale;
      canvas.setViewportTransform([scale, 0, 0, scale, tx, ty]);
      canvas.requestRenderAll();
      emitZoom(scale);
      return true;
    }, [emitZoom]);

    // Retry fit across a few animation frames — the container can briefly report
    // a 0/stale size right after mount, async image load, or fade-in animation.
    const fitWithRetry = useCallback((attempts = 8) => {
      const tick = (remaining: number) => {
        const ok = fitImageToCanvas();
        if ((!ok || remaining > 5) && remaining > 0) {
          requestAnimationFrame(() => tick(remaining - 1));
        }
      };
      tick(attempts);
    }, [fitImageToCanvas]);

    // ── Expose imperative handle ──

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,
      resetView: () => {
        userAdjustedRef.current = false;
        fitImageToCanvas();
      },
      zoomTo100: () => {
        userAdjustedRef.current = false;
        fitImageToCanvas();
      },
      zoomBy: (factor: number) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        userAdjustedRef.current = true;
        const current = canvas.getZoom();
        const next = Math.min(Math.max(current * factor, ZOOM_MIN), ZOOM_MAX);
        canvas.zoomToPoint(canvas.getCenterPoint(), next);
        canvas.requestRenderAll();
        emitZoom(next);
      },
    }));

    // ── Initialize Fabric canvas (once) ──

    useEffect(() => {
      const canvasEl = canvasElRef.current;
      const container = containerRef.current;
      if (!canvasEl || !container) return;

      const canvas = new Canvas(canvasEl, {
        width: container.clientWidth || 800,
        height: container.clientHeight || 600,
        selection: false,
        preserveObjectStacking: true,
        renderOnAddRemove: true,
        fireRightClick: false,
        stopContextMenu: true,
      });
      fabricRef.current = canvas;

      return () => {
        canvas.dispose();
        fabricRef.current = null;
        imageRef.current = null;
      };
    }, []);

    // ── Load / swap the page image ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas || !imageUrl) return;

      let cancelled = false;
      setIsLoading(true);
      setLoadError(null);

      (async () => {
        try {
          const img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
          if (cancelled || !fabricRef.current) return;

          // Fabric v7 mặc định origin = 'center'. Ép về top-left để toạ độ ảnh
          // (pixel) trùng với scene space, nhờ đó region/annotation khớp tuyệt đối.
          img.set({
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top',
            selectable: false,
            evented: false,
            hoverCursor: 'default',
          });
          img.setCoords();
          (img as TaggedObject)._isMainImage = true;
          imageRef.current = img;
          callbacksRef.current.onImageLoad?.({ width: img.width ?? 0, height: img.height ?? 0 });

          // Remove previous main image + frame to avoid leaks/stacking.
          canvas
            .getObjects()
            .filter((o) => (o as TaggedObject)._isMainImage || (o as TaggedObject)._imageFrame)
            .forEach((o) => canvas.remove(o));

          canvas.insertAt(0, img);

          // A subtle frame so the page edges are distinguishable from the backdrop.
          const frame = new Rect({
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top',
            width: img.width ?? 0,
            height: img.height ?? 0,
            fill: 'transparent',
            stroke: 'rgba(148,163,184,0.5)',
            strokeWidth: 1,
            strokeUniform: true,
            selectable: false,
            evented: false,
            hoverCursor: 'default',
            shadow: new Shadow({ color: 'rgba(0,0,0,0.5)', blur: 28, offsetX: 0, offsetY: 10 }),
          });
          (frame as TaggedObject)._imageFrame = true;
          canvas.insertAt(1, frame);

          setIsLoading(false);

          // Fit once per image URL.
          if (fittedUrlRef.current !== imageUrl) {
            fittedUrlRef.current = imageUrl;
            userAdjustedRef.current = false;
            fitWithRetry();
          } else {
            canvas.requestRenderAll();
          }
        } catch {
          if (!cancelled) {
            setLoadError('Không tải được ảnh trang. Kiểm tra lại đường dẫn ảnh.');
            setIsLoading(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [imageUrl, fitWithRetry]);

    // ── Mouse-wheel zoom (zoom to cursor) ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const handleWheel = (opt: { e: WheelEvent }) => {
        const evt = opt.e;
        evt.preventDefault();
        evt.stopPropagation();

        const zoom = canvas.getZoom();
        const next = Math.min(Math.max(zoom * Math.exp(-evt.deltaY * WHEEL_ZOOM_FACTOR), ZOOM_MIN), ZOOM_MAX);
        canvas.zoomToPoint(new Point(evt.offsetX, evt.offsetY), next);
        canvas.requestRenderAll();
        userAdjustedRef.current = true;
        emitZoom(next);
      };

      canvas.on('mouse:wheel', handleWheel);
      return () => {
        canvas.off('mouse:wheel', handleWheel);
      };
    }, [emitZoom]);

    // ── Pointer interactions: pan / draw region / drop annotation (bound once) ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const pan = { active: false, x: 0, y: 0 };
      const draw = { active: false, originX: 0, originY: 0, rect: null as Rect | null };

      const clampToImage = (x: number, y: number) => {
        const b = getImageBounds();
        if (!b) return { x, y };
        return {
          x: Math.min(Math.max(x, b.left), b.right),
          y: Math.min(Math.max(y, b.top), b.bottom),
        };
      };

      const handleMouseDown = (opt: TPointerEventInfo) => {
        const evt = opt.e as MouseEvent;
        const m = modeRef.current;

        // Pan: Alt+drag, middle-click, or pan-mode left-click.
        if (evt.altKey || evt.button === 1 || (m === 'pan' && evt.button === 0)) {
          pan.active = true;
          pan.x = evt.clientX;
          pan.y = evt.clientY;
          canvas.selection = false;
          canvas.defaultCursor = 'grabbing';
          canvas.setCursor('grabbing');
          evt.preventDefault();
          return;
        }

        // Region draw mode — start a new rect (unless clicking an existing region).
        if (m === 'region') {
          if ((opt.target as TaggedObject | undefined)?._regionId) return;
          const p = clampToImage(canvas.getScenePoint(evt).x, canvas.getScenePoint(evt).y);
          draw.active = true;
          draw.originX = p.x;
          draw.originY = p.y;
          const rect = new Rect({
            left: p.x,
            top: p.y,
            originX: 'left',
            originY: 'top',
            width: 0,
            height: 0,
            fill: REGION_FILL,
            stroke: REGION_STROKE,
            strokeWidth: 2,
            strokeUniform: true,
            strokeDashArray: [6, 4],
            selectable: false,
            evented: false,
          });
          canvas.add(rect);
          draw.rect = rect;
          return;
        }

        // Annotate mode — single click drops a pin.
        if (m === 'annotate' && callbacksRef.current.onAnnotationCreated) {
          const p = canvas.getScenePoint(evt);
          callbacksRef.current.onAnnotationCreated({
            x: Math.round(p.x),
            y: Math.round(p.y),
            type: 'Technical',
            comment: '',
          });
        }
      };

      const handleMouseMove = (opt: TPointerEventInfo) => {
        const evt = opt.e as MouseEvent;

        if (pan.active) {
          const vpt = canvas.viewportTransform;
          if (vpt) {
            vpt[4] += evt.clientX - pan.x;
            vpt[5] += evt.clientY - pan.y;
            canvas.setViewportTransform(vpt);
          }
          pan.x = evt.clientX;
          pan.y = evt.clientY;
          return;
        }

        if (draw.active && draw.rect && modeRef.current === 'region') {
          const p = clampToImage(canvas.getScenePoint(evt).x, canvas.getScenePoint(evt).y);
          const left = Math.min(draw.originX, p.x);
          const top = Math.min(draw.originY, p.y);
          const width = Math.abs(p.x - draw.originX);
          const height = Math.abs(p.y - draw.originY);
          draw.rect.set({ left, top, width, height });
          canvas.requestRenderAll();

          if (callbacksRef.current.showRegionCoords) {
            const img = imageRef.current;
            setLiveCoords(
              img
                ? sceneRectToImagePixels(img, left, top, width, height)
                : { x: Math.round(left), y: Math.round(top), width: Math.round(width), height: Math.round(height) },
            );
          }
        }
      };

      const handleMouseUp = () => {
        if (pan.active) {
          pan.active = false;
          canvas.defaultCursor = cursorForMode(modeRef.current);
          canvas.setCursor(canvas.defaultCursor);
          return;
        }

        if (draw.active && draw.rect) {
          const rect = draw.rect;
          const w = rect.width ?? 0;
          const h = rect.height ?? 0;
          if (w >= MIN_REGION_SIZE && h >= MIN_REGION_SIZE && callbacksRef.current.onRegionCreated) {
            const img = imageRef.current;
            const coords = img
              ? sceneRectToImagePixels(img, rect.left ?? 0, rect.top ?? 0, w, h)
              : { x: Math.round(rect.left ?? 0), y: Math.round(rect.top ?? 0), width: Math.round(w), height: Math.round(h) };
            callbacksRef.current.onRegionCreated({ pageId: '', ...coords });
          }
          canvas.remove(rect);
          canvas.requestRenderAll();
          draw.active = false;
          draw.rect = null;
          setLiveCoords(null);
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
    }, [getImageBounds]);

    // ── Constrain region drag/resize to the page + live readout ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const constrainMove = (rect: Rect) => {
        const b = getImageBounds();
        if (!b) return;
        const w = (rect.width ?? 0) * (rect.scaleX ?? 1);
        const h = (rect.height ?? 0) * (rect.scaleY ?? 1);
        rect.set({
          left: Math.min(Math.max(rect.left ?? 0, b.left), Math.max(b.left, b.right - w)),
          top: Math.min(Math.max(rect.top ?? 0, b.top), Math.max(b.top, b.bottom - h)),
        });
      };

      const constrainScale = (rect: Rect) => {
        const b = getImageBounds();
        if (!b) return;
        const left = Math.max(rect.left ?? 0, b.left);
        const top = Math.max(rect.top ?? 0, b.top);
        const baseW = rect.width ?? 1;
        const baseH = rect.height ?? 1;
        let scaleX = rect.scaleX ?? 1;
        let scaleY = rect.scaleY ?? 1;
        if (baseW * scaleX > b.right - left) scaleX = (b.right - left) / baseW;
        if (baseH * scaleY > b.bottom - top) scaleY = (b.bottom - top) / baseH;
        rect.set({ left, top, scaleX, scaleY });
      };

      const handleMoving = (opt: { target?: FabricObject }) => {
        const target = opt.target as (Rect & { _regionId?: string }) | undefined;
        if (!target?._regionId) return;
        constrainMove(target);
        if (callbacksRef.current.showRegionCoords) setLiveCoords(rectToImageCoords(target));
      };
      const handleScaling = (opt: { target?: FabricObject }) => {
        const target = opt.target as (Rect & { _regionId?: string }) | undefined;
        if (!target?._regionId) return;
        constrainScale(target);
        if (callbacksRef.current.showRegionCoords) setLiveCoords(rectToImageCoords(target));
      };

      canvas.on('object:moving', handleMoving);
      canvas.on('object:scaling', handleScaling);

      return () => {
        canvas.off('object:moving', handleMoving);
        canvas.off('object:scaling', handleScaling);
      };
    }, [getImageBounds, rectToImageCoords]);

    // ── Freeform drawing → bounding-box region ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      if (mode !== 'freeform') {
        canvas.isDrawingMode = false;
        return;
      }

      canvas.isDrawingMode = true;
      if (!canvas.freeDrawingBrush) canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = REGION_STROKE;
      canvas.freeDrawingBrush.width = 2;
      (canvas.freeDrawingBrush as PencilBrush & { strokeDashArray?: number[] }).strokeDashArray = [6, 4];

      const handlePathCreated = (opt: { path: FabricObject }) => {
        const rect = opt.path.getBoundingRect();
        if (rect.width >= MIN_REGION_SIZE && rect.height >= MIN_REGION_SIZE && callbacksRef.current.onRegionCreated) {
          const img = imageRef.current;
          const coords = img
            ? sceneRectToImagePixels(img, rect.left, rect.top, rect.width, rect.height)
            : { x: Math.round(rect.left), y: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };
          callbacksRef.current.onRegionCreated({ pageId: '', ...coords });
        }
        setTimeout(() => {
          canvas.remove(opt.path);
          canvas.requestRenderAll();
        }, 0);
      };

      canvas.on('path:created', handlePathCreated);
      return () => {
        canvas.off('path:created', handlePathCreated);
        canvas.isDrawingMode = false;
      };
    }, [mode]);

    // ── Render regions ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas
        .getObjects()
        .filter((o) => (o as TaggedObject)._regionId)
        .forEach((o) => canvas.remove(o));

      const editable = mode === 'region';

      regions.forEach((region) => {
        const isSelected = region.id === selectedRegionId;
        const rect = new Rect({
          left: region.x,
          top: region.y,
          originX: 'left',
          originY: 'top',
          width: region.width,
          height: region.height,
          fill: isSelected ? REGION_SELECTED_FILL : REGION_FILL,
          stroke: isSelected ? REGION_SELECTED_STROKE : REGION_STROKE,
          strokeWidth: isSelected ? 2.5 : 2,
          strokeUniform: true,
          strokeDashArray: [6, 4],
          cornerColor: REGION_SELECTED_STROKE,
          cornerStrokeColor: '#ffffff',
          cornerStyle: 'circle',
          cornerSize: 9,
          transparentCorners: false,
          selectable: editable,
          evented: true,
          hasControls: editable,
          hasBorders: editable,
          lockRotation: true,
          hoverCursor: editable ? 'move' : 'pointer',
        });
        (rect as TaggedObject)._regionId = region.id;

        rect.on('mousedown', () => callbacksRef.current.onRegionSelect?.(region.id));

        rect.on('modified', () => {
          setLiveCoords(null);
          if (onRegionUpdated) {
            const coords = rectToImageCoords(rect);
            onRegionUpdated({ ...region, ...coords });
            rect.set({ scaleX: 1, scaleY: 1, width: coords.width, height: coords.height });
          }
        });

        canvas.add(rect);
      });

      canvas.requestRenderAll();
    }, [regions, selectedRegionId, mode, onRegionUpdated, rectToImageCoords]);

    // ── Render annotations (pins) ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas
        .getObjects()
        .filter((o) => (o as TaggedObject)._annotationId)
        .forEach((o) => canvas.remove(o));

      annotations.forEach((annotation) => {
        const isSelected = annotation.id === selectedAnnotationId;
        const color = ANNOTATION_COLORS[annotation.type] ?? ANNOTATION_COLORS.Technical;
        const circle = new Circle({
          left: annotation.x - ANNOTATION_RADIUS,
          top: annotation.y - ANNOTATION_RADIUS,
          originX: 'left',
          originY: 'top',
          radius: ANNOTATION_RADIUS,
          fill: color,
          stroke: isSelected ? '#FFFFFF' : color,
          strokeWidth: isSelected ? 3 : 1.5,
          strokeUniform: true,
          selectable: false,
          evented: true,
          hoverCursor: 'pointer',
          shadow: isSelected
            ? new Shadow({ color: 'rgba(0,0,0,0.45)', blur: 10, offsetX: 0, offsetY: 2 })
            : undefined,
        });
        (circle as TaggedObject)._annotationId = annotation.id;
        circle.on('mousedown', () => callbacksRef.current.onAnnotationSelect?.(annotation.id));
        canvas.add(circle);
      });

      canvas.requestRenderAll();
    }, [annotations, selectedAnnotationId]);

    // ── Keep the canvas sized to its container ──

    useEffect(() => {
      const container = containerRef.current;
      const canvas = fabricRef.current;
      if (!container || !canvas) return;

      const observer = new ResizeObserver(() => {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        if (cw <= 0 || ch <= 0) return;
        canvas.setDimensions({ width: cw, height: ch });
        // Only re-fit automatically while the user hasn't taken control.
        if (!userAdjustedRef.current) fitImageToCanvas();
        else canvas.requestRenderAll();
      });

      observer.observe(container);
      return () => observer.disconnect();
    }, [fitImageToCanvas]);

    // ── Cursor + interaction flags per mode ──

    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.selection = false;
      canvas.skipTargetFind = mode === 'pan';
      canvas.defaultCursor = cursorForMode(mode);
      canvas.setCursor(canvas.defaultCursor);
      canvas.requestRenderAll();
    }, [mode]);

    // ── Render ──

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden bg-bg-primary border border-border-custom rounded-xl ${cursorClassForMode(mode)} ${className ?? ''}`}
      >
        <canvas ref={canvasElRef} />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-brand animate-spin" />
              <span className="text-sm text-text-secondary">Đang tải trang…</span>
            </div>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/90 z-10">
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <span className="text-danger text-sm font-medium">{loadError}</span>
              <span className="text-text-muted text-xs">Thử lại sau hoặc kiểm tra kết nối.</span>
            </div>
          </div>
        )}

        {showRegionCoords && liveCoords && (
          <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-bg-surface/95 border border-brand/40 backdrop-blur-sm shadow-md">
            <div className="flex items-center gap-3 font-mono text-[11px] leading-none text-text-secondary">
              <span>x <b className="text-brand">{liveCoords.x}</b></span>
              <span>y <b className="text-brand">{liveCoords.y}</b></span>
              <span className="text-text-muted">|</span>
              <span>{liveCoords.width} <span className="text-text-muted">×</span> {liveCoords.height}</span>
            </div>
          </div>
        )}

        {mode !== 'view' && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-bg-surface/90 border border-border-custom backdrop-blur-sm">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              {mode === 'region'
                ? '⬜ Khoanh vùng'
                : mode === 'freeform'
                  ? '✏️ Vẽ tự do'
                  : mode === 'annotate'
                    ? '📌 Ghim lỗi'
                    : '✋ Di chuyển'}
            </span>
          </div>
        )}
      </div>
    );
  },
);

CanvasViewer.displayName = 'CanvasViewer';

// ─── Cursor helpers ──────────────────────────────────────────

function cursorForMode(mode: CanvasMode): string {
  switch (mode) {
    case 'pan':
      return 'grab';
    case 'region':
    case 'freeform':
      return 'crosshair';
    case 'annotate':
      return 'cell';
    default:
      return 'default';
  }
}

function cursorClassForMode(mode: CanvasMode): string {
  switch (mode) {
    case 'pan':
      return 'cursor-grab';
    case 'region':
    case 'freeform':
      return 'cursor-crosshair';
    case 'annotate':
      return 'cursor-cell';
    default:
      return 'cursor-default';
  }
}
