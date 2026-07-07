import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageOff, ZoomIn } from 'lucide-react';

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

export interface TaskRegionPreviewProps {
  imageUrl?: string | null;
  coordinatesJson?: string | null;
  regionName?: string | null;
  className?: string;
  heightClassName?: string;
  expandable?: boolean;
  onExpand?: () => void;
}

export const TaskRegionPreview = ({
  imageUrl,
  coordinatesJson,
  regionName,
  className = '',
  heightClassName = 'h-36',
  expandable = false,
  onExpand,
}: TaskRegionPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [layout, setLayout] = useState<ImageLayout | null>(null);
  const coords = parseCoordinatesJson(coordinatesJson);
  const displayUrl = imageUrl ? resolveMediaUrl(imageUrl) : '';
  const hasRegion = coords.width > 0 && coords.height > 0;

  const updateLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container || !naturalSize) return;
    setLayout(computeObjectContainLayout(container.clientWidth, container.clientHeight, naturalSize.w, naturalSize.h));
  }, [naturalSize]);

  useEffect(() => {
    updateLayout();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateLayout]);

  if (!displayUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-border-custom bg-bg-surface text-text-muted ${heightClassName} ${className}`}
      >
        <ImageOff size={22} className="opacity-50" />
        <span className="text-[11px]">Chưa có ảnh trang</span>
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
      key={displayUrl || 'empty'}
      ref={containerRef}
      className={`group/preview relative overflow-hidden rounded-xl border border-border-custom bg-black/30 ${heightClassName} ${className} ${
        expandable ? 'cursor-zoom-in' : ''
      }`}
      onClick={expandable ? onExpand : undefined}
      onKeyDown={
        expandable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onExpand?.();
              }
            }
          : undefined
      }
      role={expandable ? 'button' : undefined}
      tabIndex={expandable ? 0 : undefined}
      aria-label={expandable ? 'Phóng to vùng cần vẽ' : undefined}
    >
      <img
        src={displayUrl}
        alt={regionName ? `Vùng vẽ: ${regionName}` : 'Ảnh trang truyện'}
        className="absolute inset-0 h-full w-full object-contain"
        onLoad={(e) => {
          const img = e.currentTarget;
          setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        }}
      />

      {regionStyle && (
        <div
          className="pointer-events-none absolute rounded-sm border-2 border-brand bg-brand/20 shadow-[0_0_0_1px_rgba(108,92,231,0.35)]"
          style={regionStyle}
        />
      )}

      {regionName && (
        <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {regionName}
        </span>
      )}

      {expandable && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover/preview:bg-black/25 group-hover/preview:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <ZoomIn size={13} />
            Xem vùng vẽ
          </span>
        </div>
      )}
    </div>
  );
};
