import {
  MousePointer2,
  SquareDashedBottom,
  MapPin,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Pencil,
  Trash2,
} from 'lucide-react';

import type { CanvasTool } from '../../stores/canvasStore';

// ─── Types ───────────────────────────────────────────────────

interface CanvasToolbarProps {
  activeTool: CanvasTool;
  zoomLevel: number;
  onToolChange: (tool: CanvasTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomFit: () => void;
  showRegionTool?: boolean;
  showAnnotateTool?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
  /** docked = flat chrome in a top bar; floating = pill overlay on canvas */
  variant?: 'docked' | 'floating';
}

// ─── Tool Config ─────────────────────────────────────────────

interface ToolConfig {
  tool: CanvasTool;
  icon: typeof MousePointer2;
  label: string;
}

const ALL_TOOLS: ToolConfig[] = [
  { tool: 'select', icon: MousePointer2, label: 'Chọn (V)' },
  { tool: 'region', icon: SquareDashedBottom, label: 'Khoanh vùng (R)' },
  { tool: 'freeform', icon: Pencil, label: 'Vẽ tự do (F)' },
  { tool: 'annotate', icon: MapPin, label: 'Ghim lỗi (A)' },
  { tool: 'pan', icon: Hand, label: 'Di chuyển (Space)' },
];

// ─── Component ───────────────────────────────────────────────

export const CanvasToolbar = ({
  activeTool,
  zoomLevel,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
  showRegionTool = true,
  showAnnotateTool = true,
  canDelete = false,
  onDelete,
  variant = 'floating',
}: CanvasToolbarProps) => {
  const visibleTools = ALL_TOOLS.filter((t) => {
    if ((t.tool === 'region' || t.tool === 'freeform') && !showRegionTool) return false;
    if (t.tool === 'annotate' && !showAnnotateTool) return false;
    return true;
  });

  const zoomPercentage = Math.round(zoomLevel * 100);

  const shellClass =
    variant === 'docked'
      ? 'flex items-center gap-1 rounded-xl bg-bg-primary border border-border-custom px-1.5 py-1'
      : 'flex items-center gap-1 rounded-2xl bg-bg-primary/90 backdrop-blur-xl border border-border-custom shadow-lg px-2 py-1.5';

  return (
    <div className={shellClass}>
      {/* ── Tool Buttons ── */}
      <div className="flex items-center gap-0.5">
        {visibleTools.map(({ tool, icon: Icon, label }) => {
          const isActive = activeTool === tool;
          return (
            <button
              key={tool}
              type="button"
              title={label}
              onClick={() => onToolChange(tool)}
              className={`
                relative flex items-center justify-center w-9 h-9 rounded-xl
                transition-all duration-150 ease-out
                ${
                  isActive
                    ? 'bg-brand text-white shadow-lg shadow-brand/25'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                }
              `}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
            </button>
          );
        })}
      </div>

      {/* ── Separator ── */}
      <div className="w-px h-6 bg-border-custom mx-1" />

      {/* ── Zoom Controls ── */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          title="Thu nhỏ"
          onClick={onZoomOut}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors duration-150"
        >
          <ZoomOut size={18} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          title="Đặt lại zoom"
          onClick={onZoomReset}
          className="flex items-center justify-center min-w-[3.25rem] h-9 rounded-xl px-2 text-xs font-medium text-text-primary hover:bg-bg-surface transition-colors duration-150 tabular-nums"
        >
          {zoomPercentage}%
        </button>

        <button
          type="button"
          title="Phóng to"
          onClick={onZoomIn}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors duration-150"
        >
          <ZoomIn size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Separator ── */}
      <div className="w-px h-6 bg-border-custom mx-1" />

      {/* ── Fit & Reset ── */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          title="Vừa khung hình"
          onClick={onZoomFit}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors duration-150"
        >
          <Maximize2 size={18} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          title="Đặt lại khung vẽ"
          onClick={onZoomReset}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors duration-150"
        >
          <RotateCcw size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Delete Button ── */}
      {canDelete && onDelete && (
        <>
          <div className="w-px h-6 bg-border-custom mx-1" />
          <button
            type="button"
            title="Xóa vùng đã chọn (Delete/Backspace)"
            onClick={onDelete}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-danger hover:bg-danger/10 transition-colors duration-150"
          >
            <Trash2 size={18} strokeWidth={1.8} />
          </button>
        </>
      )}
    </div>
  );
};
