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
  disableFullscreen?: boolean;
}

/** Mini-canvas: đặt PNG overlay lên BaseLayer theo tọa độ Region (F2.8 / F2.5). */
export const TaskLayerPreview = (props: TaskLayerPreviewProps) => {
  const {
    baseImageUrl,
    overlayImageUrl,
    coordinatesJson,
    regionName,
    className = '',
    heightClassName = 'h-56',
    label,
    disableFullscreen,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [layout, setLayout] = useState<ImageLayout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    updateLayout();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateLayout]);

  if (!baseUrl || imgError) {
    if (overlayUrl) {
      // Fallback to showing just the overlay if base image fails
      return (
        <div className={`flex items-center justify-center gap-2 rounded-xl border border-border-custom bg-black/30 ${heightClassName} ${className}`}>
          <img src={overlayUrl} alt="Lớp vẽ overlay" className="h-full w-full object-contain" />
          {(label || regionName) && (
            <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm z-10">
              {label || regionName} (chỉ có lớp nộp)
            </span>
          )}
        </div>
      );
    }
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
    <>
      <div
        ref={containerRef}
        onClick={() => !disableFullscreen && setIsFullscreen(true)}
        className={`group relative overflow-hidden rounded-xl border border-border-custom bg-black/30 ${heightClassName} ${className} ${!disableFullscreen ? 'cursor-pointer' : ''}`}
      >
        <img
          src={baseUrl}
          alt="Bản thảo gốc"
          className="absolute inset-0 h-full w-full object-contain"
          onLoad={(e) => {
            const img = e.currentTarget;
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
            setImgError(false);
          }}
          onError={() => setImgError(true)}
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
          <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm z-10">
            {label || regionName}
          </span>
        )}

        {!disableFullscreen && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              Phóng to
            </div>
          </div>
        )}
      </div>

      {isFullscreen && !disableFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10 pointer-events-none">
            <span className="text-white font-medium text-sm drop-shadow-md">{label || regionName || 'Xem trước'}</span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors pointer-events-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="flex-1 w-full h-full p-4 md:p-12 pb-16 flex items-center justify-center overflow-hidden">
             <TaskLayerPreview
               {...props}
               disableFullscreen={true}
               heightClassName="h-full"
               className="border-none rounded-none bg-transparent w-full"
               label={undefined}
               regionName={undefined}
             />
          </div>
        </div>
      )}
    </>
  );
};
