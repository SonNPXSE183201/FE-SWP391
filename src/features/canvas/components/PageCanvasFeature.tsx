import { useState, useMemo, useCallback } from 'react';
import {
  Layers, MapPin, SquareDashedBottom, Trash2,
  Tag, CheckCircle2, Clock, AlertTriangle,
  ChevronLeft, ChevronRight, Loader2, ImageOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CanvasViewer } from '../../../components/canvas/CanvasViewer';
import { CanvasToolbar } from '../../../components/canvas/CanvasToolbar';
import { MobileCanvasWarning } from '../../../components/canvas/MobileCanvasWarning';
import { useCanvasStore } from '../../../stores/canvasStore';
import { useRegions, useCreateRegion, useDeleteRegion } from '../hooks/useCanvasData';
import { MOCK_CANVAS_PAGES, getRegionsByPageId } from '../data/mockData';
import type { Region } from '../../../types/entities';

interface PageCanvasFeatureProps {
  chapterId?: string;
}

const PAGE_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  Pending: { bg: 'bg-text-muted/10', text: 'text-text-muted', label: 'Chờ xử lý' },
  InProgress: { bg: 'bg-info/10', text: 'text-info', label: 'Đang làm' },
  Completed: { bg: 'bg-success/10', text: 'text-success', label: 'Hoàn thành' },
  NeedsRevision: { bg: 'bg-warning/10', text: 'text-warning', label: 'Cần sửa' },
};

export const PageCanvasFeature = ({ chapterId = 'ch-1' }: PageCanvasFeatureProps) => {
  // ─── State ───
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [regionLabel, setRegionLabel] = useState('');
  const { activeTool, zoomLevel, selectedRegionId, setActiveTool, setZoomLevel, setSelectedRegion } = useCanvasStore();

  // ─── Data (mock) ───
  const pages = useMemo(() => MOCK_CANVAS_PAGES.filter((p) => p.chapterId === chapterId), [chapterId]);
  const currentPage = pages[currentPageIndex];
  const pageId = currentPage?.id ?? '';

  const regions = useMemo(() => getRegionsByPageId(pageId), [pageId]);
  const createRegion = useCreateRegion(pageId);
  const deleteRegion = useDeleteRegion(pageId);

  // ─── Handlers ───
  const handleRegionCreated = useCallback(
    (region: Omit<Region, 'id' | 'createdAt' | 'updatedAt'>) => {
      createRegion.mutate(
        { pageId, x: region.x, y: region.y, width: region.width, height: region.height, label: regionLabel || undefined },
        {
          onSuccess: () => {
            toast.success('Đã tạo region mới');
            setRegionLabel('');
          },
        },
      );
    },
    [pageId, regionLabel, createRegion],
  );

  const handleDeleteRegion = useCallback(
    (regionId: string) => {
      deleteRegion.mutate(regionId, {
        onSuccess: () => {
          toast.success('Đã xoá region');
          setSelectedRegion(null);
        },
      });
    },
    [deleteRegion, setSelectedRegion],
  );

  const handleZoomIn = useCallback(() => setZoomLevel(Math.min(zoomLevel * 1.2, 5)), [zoomLevel, setZoomLevel]);
  const handleZoomOut = useCallback(() => setZoomLevel(Math.max(zoomLevel / 1.2, 0.1)), [zoomLevel, setZoomLevel]);
  const handleZoomReset = useCallback(() => setZoomLevel(1), [setZoomLevel]);

  if (!currentPage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <ImageOff size={48} className="text-text-muted" />
        <p className="text-text-secondary">Không tìm thấy trang nào trong chapter này</p>
      </div>
    );
  }

  const statusConfig = PAGE_STATUS_COLORS[currentPage.status] ?? PAGE_STATUS_COLORS.Pending;

  return (
    <>
      <MobileCanvasWarning />
      <div className="hidden md:flex flex-col gap-4 animate-fade-in h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Layers size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Trang {currentPage.pageNumber} / {pages.length}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
                <span className="text-[10px] text-text-muted">
                  {regions.length} region(s)
                </span>
              </div>
            </div>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
              className="w-8 h-8 rounded-lg bg-bg-secondary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-mono text-text-secondary min-w-[60px] text-center">
              {currentPageIndex + 1} / {pages.length}
            </span>
            <button
              onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
              disabled={currentPageIndex === pages.length - 1}
              className="w-8 h-8 rounded-lg bg-bg-secondary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Canvas */}
          <div className="flex-1 relative bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
            <CanvasViewer
              imageUrl={currentPage.imageUrl}
              regions={regions}
              mode={activeTool === 'region' ? 'region' : 'view'}
              onRegionCreated={handleRegionCreated}
              selectedRegionId={selectedRegionId}
              onRegionSelect={setSelectedRegion}
              className="w-full h-full"
            />

            {/* Toolbar overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <CanvasToolbar
                activeTool={activeTool}
                zoomLevel={zoomLevel}
                onToolChange={setActiveTool}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
                onZoomFit={handleZoomReset}
                showRegionTool
                showAnnotateTool={false}
              />
            </div>
          </div>

          {/* Sidebar — Region List */}
          <div className="w-72 flex-shrink-0 bg-bg-secondary border border-border-custom rounded-xl flex flex-col">
            <div className="p-4 border-b border-border-custom">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <SquareDashedBottom size={14} className="text-brand" />
                Danh sách Region
              </h3>

              {/* Region label input (when in region mode) */}
              {activeTool === 'region' && (
                <div className="mt-3">
                  <label className="text-[10px] text-text-muted mb-1 block">Tên vùng (tùy chọn)</label>
                  <input
                    type="text"
                    value={regionLabel}
                    onChange={(e) => setRegionLabel(e.target.value)}
                    placeholder="VD: Nền bầu trời"
                    className="w-full px-3 py-1.5 text-xs bg-bg-primary border border-border-custom rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-brand/50"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {regions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-text-muted">
                  <SquareDashedBottom size={24} />
                  <p className="text-xs text-center">Chưa có region nào.<br />Chọn công cụ Region để bắt đầu vẽ.</p>
                </div>
              ) : (
                regions.map((region, idx) => (
                  <div
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id === selectedRegionId ? null : region.id)}
                    className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                      region.id === selectedRegionId
                        ? 'border-brand/40 bg-brand/5'
                        : 'border-border-custom/50 bg-bg-primary hover:border-brand/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-brand/10 flex items-center justify-center text-[10px] font-bold text-brand">
                          {idx + 1}
                        </div>
                        <span className="text-xs font-medium text-text-primary truncate max-w-[120px]">
                          {region.label || `Region ${idx + 1}`}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRegion(region.id); }}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-danger hover:bg-danger/10 transition-all cursor-pointer bg-transparent border-none"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-text-muted">
                      <span>x:{Math.round(region.x)} y:{Math.round(region.y)}</span>
                      <span>{Math.round(region.width)}×{Math.round(region.height)}</span>
                    </div>
                    {region.taskId && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Tag size={10} className="text-info" />
                        <span className="text-[10px] text-info">Đã gán task</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
