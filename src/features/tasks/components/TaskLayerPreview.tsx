import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { parseCoordinatesJson } from '../../canvas/utils/canvas.utils';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';

interface ImageLayout {
  offsetX: number;
  offsetY: number;
  displayW: number;
  displayH: number;
}

const computeObjectContainLayout = (
  containerW: number,
  containerH: number,
  imgW: number,
  imgH: number,
): ImageLayout => {
  const scale = Math.min(containerW / imgW, containerH / imgH);
  const displayW = imgW * scale;
  const displayH = imgH * scale;
  return {
    offsetX: (containerW - displayW) / 2,
    offsetY: (containerH - displayH) / 2,
    displayW,
    displayH,
  };
};

export interface TaskLayerPreviewProps {
  baseImageUrl?: string | null;
  overlayImageUrl?: string | null;
  coordinatesJson?: string | null;
  regionName?: string | null;
  className?: string;
  heightClassName?: string;
  label?: string;
}

/** Mini-canvas: đặt PNG overlay lên BaseLayer theo tọa độ Region (F2.8 / F2.5). */
export const TaskLayerPreview = ({
  baseImageUrl,
  overlayImageUrl,
  coordinatesJson,
  regionName,
  className = '',
  heightClassName = 'h-56',
  label,
}: TaskLayerPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [layout, setLayout] = useState<ImageLayout | null>(null);
  const coords = parseCoordinatesJson(coordinatesJson);
  const baseUrl = baseImageUrl ? resolveMediaUrl(baseImageUrl) : '';
  const overlayUrl = overlayImageUrl ? resolveMediaUrl(overlayImageUrl) : '';
  const hasRegion = coords.width > 0 && coords.height > 0;

  const updateLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container || !naturalSize) return;
    const rect = container.getBoundingClientRect();
    setLayout(computeObjectContainLayout(rect.width, rect.height, naturalSize.w, naturalSize.h));
  }, [naturalSize]);

  useEffect(() => {
    updateLayout();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateLayout]);

  if (!baseUrl) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-border-custom bg-bg-surface text-text-muted ${heightClassName} ${className}`}>
        <ImageOff size={22} className="opacity-50" />
        <span className="text-[11px]">Chưa có ảnh nền trang</span>
      </div>
    );
  }

  const regionStyle = layout && hasRegion
    ? {
        left: layout.offsetX + (coords.x / naturalSize!.w) * layout.displayW,
        top: layout.offsetY + (coords.y / naturalSize!.h) * layout.displayH,
        width: (coords.width / naturalSize!.w) * layout.displayW,
        height: (coords.height / naturalSize!.h) * layout.displayH,
      }
    : null;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border border-border-custom bg-black/30 ${heightClassName} ${className}`}
    >
      <img
        src={baseUrl}
        alt="Bản thảo gốc"
        className="absolute inset-0 h-full w-full object-contain"
        onLoad={(e) => {
          const img = e.currentTarget;
          setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        }}
      />

      {regionStyle && overlayUrl && (
        <div className="absolute overflow-hidden pointer-events-none" style={regionStyle}>
          <img src={overlayUrl} alt="Lớp vẽ overlay" className="w-full h-full object-contain" />
        </div>
      )}

      {regionStyle && (
        <div
          className="pointer-events-none absolute rounded-sm border border-brand/50"
          style={regionStyle}
        />
      )}

      {(label || regionName) && (
        <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {label || regionName}
        </span>
      )}
    </div>
  );
};
