import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImageOff, Loader2 } from "lucide-react";
import { parseCoordinatesJson } from "../../canvas/utils/canvas.utils";
import { resolveMediaUrl } from "../../../utils/resolveMediaUrl";

interface ImageLayout {
  offsetX: number;
  offsetY: number;
  displayW: number;
  displayH: number;
}

const IMAGE_RETRY_DELAYS_MS = [700, 1400, 2400];

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
  overlayMode?: "auto" | "region" | "full-page";
  backdrop?: "dark" | "checkerboard";
}

/** Mini-canvas: đặt PNG overlay lên BaseLayer theo tọa độ Region (F2.8 / F2.5). */
export const TaskLayerPreview = (props: TaskLayerPreviewProps) => {
  const {
    baseImageUrl,
    overlayImageUrl,
    coordinatesJson,
    regionName,
    className = "",
    heightClassName = "h-56",
    label,
    disableFullscreen,
    overlayMode = "auto",
    backdrop = "dark",
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{
    url: string;
    w: number;
    h: number;
  } | null>(null);
  const [overlayNaturalSize, setOverlayNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [layout, setLayout] = useState<ImageLayout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const coords = parseCoordinatesJson(coordinatesJson);
  const baseUrl = baseImageUrl ? resolveMediaUrl(baseImageUrl) : "";
  const overlayUrl = overlayImageUrl ? resolveMediaUrl(overlayImageUrl) : "";
  const hasRegion = coords.width > 0 && coords.height > 0;
  const currentNaturalSize = naturalSize?.url === baseUrl ? naturalSize : null;

  const updateLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container || !currentNaturalSize) return;
    const rect = container.getBoundingClientRect();
    setLayout(
      computeObjectContainLayout(
        rect.width,
        rect.height,
        currentNaturalSize.w,
        currentNaturalSize.h,
      ),
    );
  }, [currentNaturalSize]);

  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [baseRetry, setBaseRetry] = useState<{ url: string; retry: number }>({
    url: baseUrl,
    retry: 0,
  });
  const baseFailed = !!baseUrl && failedUrl === baseUrl;
  const imgError = baseFailed && !overlayUrl;
  const hasBaseImage = !!baseUrl && !baseFailed;
  const currentBaseRetry = baseRetry.url === baseUrl ? baseRetry.retry : 0;
  const imageSrc = appendRetryParam(baseUrl, currentBaseRetry);
  const isWaitingForBase = !!baseUrl && !baseFailed && !currentNaturalSize;
  const hasVisibleOverlay = !!overlayNaturalSize;
  const showBlockingLoader = isWaitingForBase && !hasVisibleOverlay;
  const showNonBlockingLoader = isWaitingForBase && hasVisibleOverlay;
  const backdropClassName =
    backdrop === "checkerboard" ? "bg-white" : "bg-black/30";
  const backdropStyle =
    backdrop === "checkerboard"
      ? {
          backgroundColor: "#ffffff",
          backgroundImage:
            "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
          backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
          backgroundSize: "24px 24px",
        }
      : undefined;

  useEffect(() => {
    updateLayout();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateLayout]);

  if (imgError) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-border-custom bg-bg-surface text-text-muted ${heightClassName} ${className}`}
      >
        <ImageOff size={22} className="opacity-50" />
        <span className="text-[11px]">Không tải được ảnh</span>
      </div>
    );
  }

  const regionStyle =
    layout && hasRegion && currentNaturalSize
      ? {
          left:
            layout.offsetX + (coords.x / currentNaturalSize.w) * layout.displayW,
          top:
            layout.offsetY +
            (coords.y / currentNaturalSize.h) * layout.displayH,
          width: (coords.width / currentNaturalSize!.w) * layout.displayW,
          height: (coords.height / currentNaturalSize!.h) * layout.displayH,
        }
      : null;

  return (
    <>
      <div
        ref={containerRef}
        onClick={() => !disableFullscreen && setIsFullscreen(true)}
        className={`group relative overflow-hidden rounded-xl border border-border-custom ${backdropClassName} ${heightClassName} ${className} ${!disableFullscreen ? "cursor-pointer" : ""}`}
        style={backdropStyle}
      >
        {hasBaseImage && (
          <img
            key={imageSrc}
            src={imageSrc}
            alt="Bản thảo gốc"
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-contain"
            onLoad={(e) => {
              const img = e.currentTarget;
              setNaturalSize({
                url: baseUrl,
                w: img.naturalWidth,
                h: img.naturalHeight,
              });
              setFailedUrl(null);
            }}
            onError={() => {
              const nextDelay = IMAGE_RETRY_DELAYS_MS[currentBaseRetry];
              if (nextDelay != null) {
                window.setTimeout(
                  () =>
                    setBaseRetry((current) => ({
                      url: baseUrl,
                      retry:
                        current.url === baseUrl ? current.retry + 1 : 1,
                    })),
                  nextDelay,
                );
                return;
              }
              setFailedUrl(baseUrl);
            }}
          />
        )}

        {overlayUrl && (
          <>
            {/* 
              Determine if overlay is a patch or full-page. 
              If we don't know yet, we render it hidden to get dimensions.
            */}
            <img
              src={overlayUrl}
              alt="Overlay detector"
              draggable={false}
              className="hidden"
              onLoad={(e) =>
                setOverlayNaturalSize({
                  w: e.currentTarget.naturalWidth,
                  h: e.currentTarget.naturalHeight,
                })
              }
            />

            {overlayNaturalSize &&
            overlayMode !== "region" &&
            (overlayMode === "full-page" ||
              (!!currentNaturalSize &&
                overlayNaturalSize.w >= currentNaturalSize.w * 0.8)) ? (
              // Full-page overlay
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  src={overlayUrl}
                  alt="Lớp vẽ overlay"
                  draggable={false}
                  className="w-full h-full select-none object-contain"
                />
              </div>
            ) : regionStyle ? (
              // Patch overlay
              <div
                className="absolute overflow-hidden pointer-events-none"
                style={regionStyle}
              >
                <img
                  src={overlayUrl}
                  alt="Lớp vẽ overlay"
                  draggable={false}
                  className={`w-full h-full select-none ${overlayMode === "region" ? "object-fill" : "object-contain"}`}
                />
              </div>
            ) : null}
          </>
        )}

        {regionStyle && (
          <div
            className="pointer-events-none absolute rounded-sm border border-brand/50 border-dashed bg-brand/5"
            style={regionStyle}
          />
        )}

        {(label || regionName) && (
          <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm z-10">
            {label || regionName}
          </span>
        )}

        {showBlockingLoader && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg-surface/70 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-full border border-border-custom bg-bg-secondary/90 px-3 py-2 text-xs font-medium text-text-secondary shadow-sm">
              <Loader2 size={14} className="animate-spin text-brand" />
              Đang tải ảnh ...
            </div>
          </div>
        )}

        {showNonBlockingLoader && (
          <div className="absolute right-2 bottom-2 z-30 flex items-center gap-1.5 rounded-full border border-border-custom bg-black/60 px-2.5 py-1.5 text-[10px] font-medium text-white/85 backdrop-blur-sm">
            <Loader2 size={12} className="animate-spin text-brand" />
            Đang tải ảnh nền ...
          </div>
        )}

        {!disableFullscreen && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 text-sm font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
              Phóng to
            </div>
          </div>
        )}
      </div>

      {isFullscreen &&
        !disableFullscreen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black animate-in fade-in duration-200">
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-5 py-4 pointer-events-none">
              <span className="max-w-[calc(100%-4rem)] truncate text-sm font-semibold text-white drop-shadow-md">
                {label || regionName || "Xem trước"}
              </span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="rounded-full bg-black/55 p-2 text-white transition-colors hover:bg-black/80 pointer-events-auto"
                aria-label="Đóng xem toàn màn hình"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <TaskLayerPreview
                {...props}
                disableFullscreen={true}
                heightClassName="h-screen"
                className="h-screen w-screen border-none rounded-none bg-transparent"
                label={undefined}
                regionName={undefined}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

function appendRetryParam(url: string, retry: number): string {
  if (
    !url ||
    retry <= 0 ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}retry=${retry}`;
}
