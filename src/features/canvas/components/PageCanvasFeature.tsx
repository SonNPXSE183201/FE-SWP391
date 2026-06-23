import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Layers, SquareDashedBottom, Trash2,
  Tag, ChevronLeft, ChevronRight, ImageOff,
  Plus, Pencil, Check, X, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAxiosErrorMessage } from '../../../api/axios';
import { CanvasViewer } from '../../../components/canvas/CanvasViewer';
import { CanvasToolbar } from '../../../components/canvas/CanvasToolbar';
import { MobileCanvasWarning } from '../../../components/canvas/MobileCanvasWarning';
import { useCanvasStore } from '../../../stores/canvasStore';
import { useRegions, useCreateRegion, useDeleteRegion, useUpdateRegion, useCanvasPages } from '../hooks/useCanvasData';
import { useChapterDetail } from '../../series';
import { CreateTaskModal } from '../../tasks';
import type { Region } from '../../../types/entities';
import type { CanvasViewerHandle } from '../../../components/canvas/CanvasViewer';

interface PageCanvasFeatureProps {
  chapterId?: string;
}

const PAGE_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  Pending: { bg: 'bg-text-muted/10', text: 'text-text-muted', label: 'Chờ xử lý' },
  InProgress: { bg: 'bg-info/10', text: 'text-info', label: 'Đang làm' },
  Completed: { bg: 'bg-success/10', text: 'text-success', label: 'Hoàn thành' },
  NeedsRevision: { bg: 'bg-warning/10', text: 'text-warning', label: 'Cần sửa' },
};

export const PageCanvasFeature = ({ chapterId = '1' }: PageCanvasFeatureProps) => {
  // ─── Refs ───
  const canvasRef = useRef<CanvasViewerHandle>(null);

  // ─── State ───
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [regionLabel, setRegionLabel] = useState('');
  const [regionLabelError, setRegionLabelError] = useState(false);
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const { activeTool, zoomLevel, selectedRegionId, setActiveTool, setZoomLevel, setSelectedRegion } = useCanvasStore();

  // ─── Data ───
  const { data: chapterDetail } = useChapterDetail(chapterId);
  const { data: pages = [], isLoading: pagesLoading } = useCanvasPages(chapterId);
  const currentPage = pages[currentPageIndex];
  const pageId = currentPage?.id ?? '';

  const { data: regions = [] } = useRegions(pageId);
  const createRegion = useCreateRegion(pageId);
  const updateRegion = useUpdateRegion(pageId);
  const deleteRegion = useDeleteRegion(pageId);

  // ─── Handlers ───
  const handleRegionCreated = useCallback(
    (region: Omit<Region, 'id' | 'createdAt' | 'updatedAt'>) => {
      // Client-side validation: tên vùng là bắt buộc
      if (!regionLabel.trim()) {
        toast.error('Vui lòng nhập tên vùng trước khi vẽ.');
        setRegionLabelError(true);
        return;
      }

      createRegion.mutate(
        { pageId, x: region.x, y: region.y, width: region.width, height: region.height, label: regionLabel.trim() },
        {
          onSuccess: (res) => {
            toast.success('Đã tạo region mới');
            setRegionLabel('');
            setRegionLabelError(false);
            // Auto-switch back to select mode after drawing
            setActiveTool('select');
            
            // Auto-select the newly created region (but DO NOT open task modal automatically)
            const newRegion = res.data?.data as { id?: number | string } | undefined;
            if (newRegion?.id != null) {
              setSelectedRegion(String(newRegion.id));
            }
          },
          onError: (error) => {
            toast.error(getAxiosErrorMessage(error, 'Không thể tạo region. Vui lòng thử lại.'));
          },
        },
      );
    },
    [pageId, regionLabel, createRegion, setActiveTool, setSelectedRegion],
  );

  const handleUpdateLabel = useCallback(
    (regionId: string, newLabel: string) => {
      // Include current coordinates so backend doesn't reject with "coordinatesJson required"
      const currentRegion = regions.find((r: Region) => r.id === regionId);
      updateRegion.mutate(
        {
          regionId,
          data: {
            label: newLabel,
            ...(currentRegion ? { x: currentRegion.x, y: currentRegion.y, width: currentRegion.width, height: currentRegion.height } : {}),
          },
        },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật tên vùng');
            setEditingRegionId(null);
          },
          onError: (error) => {
            toast.error(getAxiosErrorMessage(error, 'Không thể cập nhật tên vùng.'));
          },
        }
      );
    },
    [updateRegion, regions]
  );

  const handleDeleteRegion = useCallback(
    (regionId: string) => {
      deleteRegion.mutate(regionId, {
        onSuccess: () => {
          toast.success('Đã xoá region');
          setSelectedRegion(null);
        },
        onError: (error) => {
          toast.error(getAxiosErrorMessage(error, 'Không thể xoá region.'));
        },
      });
    },
    [deleteRegion, setSelectedRegion],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent deleting or switching tools if the user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedRegionId) {
          handleDeleteRegion(selectedRegionId);
        }
        return;
      }

      // Tool shortcuts
      const key = e.key.toLowerCase();
      if (key === 'v') setActiveTool('select');
      if (key === 'r') setActiveTool('region');
      if (key === 'f') setActiveTool('freeform');
      if (key === 'a') setActiveTool('annotate');
      if (e.code === 'Space') {
        e.preventDefault(); // prevent page scroll
        setActiveTool('pan');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRegionId, handleDeleteRegion, setActiveTool]);

  // ─── Zoom handlers that ACTUALLY affect the canvas ───
  const handleZoomIn = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;
    const newZoom = Math.min(zoomLevel * 1.25, 5);
    const center = canvas.getCenterPoint();
    canvas.zoomToPoint(center, newZoom);
    canvas.renderAll();
    setZoomLevel(newZoom);
  }, [zoomLevel, setZoomLevel]);

  const handleZoomOut = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;
    const newZoom = Math.max(zoomLevel / 1.25, 0.1);
    const center = canvas.getCenterPoint();
    canvas.zoomToPoint(center, newZoom);
    canvas.renderAll();
    setZoomLevel(newZoom);
  }, [zoomLevel, setZoomLevel]);

  const handleZoomReset = useCallback(() => {
    canvasRef.current?.zoomTo100();
  }, []);

  const handleZoomFit = useCallback(() => {
    canvasRef.current?.resetView();
    // Read actual zoom from canvas after fit
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) setZoomLevel(canvas.getZoom());
  }, [setZoomLevel]);

  if (pagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

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
      <div className="hidden md:flex flex-col gap-3 animate-fade-in h-[calc(100vh-120px)]">

        {/* ═══ Top Bar: Page info + Toolbar + Page nav ═══ */}
        <div className="flex items-center justify-between flex-shrink-0 bg-bg-secondary border border-border-custom rounded-xl px-4 py-2.5">
          {/* Left: Page info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <Layers size={18} className="text-brand" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">
                Trang {currentPage.pageNumber} / {pages.length}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
                <span className="text-[10px] text-text-muted">
                  {regions.length} region(s)
                </span>
              </div>
            </div>
          </div>

          {/* Center: Toolbar */}
          <CanvasToolbar
            activeTool={activeTool}
            zoomLevel={zoomLevel}
            onToolChange={setActiveTool}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onZoomFit={handleZoomFit}
            showRegionTool
            showAnnotateTool={false}
            canDelete={!!selectedRegionId}
            onDelete={() => selectedRegionId && handleDeleteRegion(selectedRegionId)}
          />

          {/* Right: Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
              className="w-8 h-8 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-mono text-text-secondary min-w-[60px] text-center">
              {currentPageIndex + 1} / {pages.length}
            </span>
            <button
              onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
              disabled={currentPageIndex === pages.length - 1}
              className="w-8 h-8 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ═══ Main Canvas Area ═══ */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Canvas — full height, no toolbar overlay */}
          <div className="flex-1 relative bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
            <CanvasViewer
              ref={canvasRef}
              imageUrl={currentPage.imageUrl}
              regions={regions}
              mode={activeTool === 'select' ? 'view' : activeTool}
              onRegionCreated={handleRegionCreated}
              selectedRegionId={selectedRegionId}
              onRegionSelect={setSelectedRegion}
              onZoomChange={setZoomLevel}
              className="w-full h-full"
            />
          </div>

          {/* Sidebar — Region List */}
          <div className="w-72 flex-shrink-0 bg-bg-secondary border border-border-custom rounded-xl flex flex-col">
            <div className="p-4 border-b border-border-custom">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <SquareDashedBottom size={14} className="text-brand" />
                Danh sách Region
              </h3>

              {/* Region label input (when in region or freeform mode) */}
              {(activeTool === 'region' || activeTool === 'freeform') && (
                <div className="mt-3">
                  <label className="text-[10px] text-text-muted mb-1 block">
                    Tên vùng <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={regionLabel}
                    onChange={(e) => {
                      setRegionLabel(e.target.value);
                      if (e.target.value.trim()) setRegionLabelError(false);
                    }}
                    placeholder="VD: Nền bầu trời"
                    className={`w-full px-3 py-1.5 text-xs bg-bg-primary border rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none transition-colors ${
                      regionLabelError
                        ? 'border-danger focus:border-danger'
                        : 'border-border-custom focus:border-brand/50'
                    }`}
                  />
                  {regionLabelError && (
                    <p className="text-[10px] text-danger mt-1">Vui lòng nhập tên vùng</p>
                  )}
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
                regions.map((region: Region, idx: number) => (
                  <div
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id === selectedRegionId ? null : region.id)}
                    className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                      region.id === selectedRegionId
                        ? 'border-brand/40 bg-brand/5'
                        : 'border-border-custom/50 bg-bg-primary hover:border-brand/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-brand/10 flex items-center justify-center text-[10px] font-bold text-brand flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between group">
                        {editingRegionId === region.id ? (
                          <div className="flex items-center gap-1 w-full mr-2">
                            <input
                              type="text"
                              value={editingLabel}
                              onChange={(e) => setEditingLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateLabel(region.id, editingLabel);
                                if (e.key === 'Escape') setEditingRegionId(null);
                              }}
                              autoFocus
                              className="flex-1 text-xs px-2 py-1 bg-bg-surface border border-brand/50 rounded-md outline-none text-text-primary focus:border-brand"
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateLabel(region.id, editingLabel); }}
                              className="w-6 h-6 flex justify-center items-center rounded bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingRegionId(null); }}
                              className="w-6 h-6 flex justify-center items-center rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="truncate text-xs font-medium text-text-primary group-hover:text-brand transition-colors">
                              {region.label || `Region ${idx + 1}`}
                            </div>
                            
                            {/* Actions wrapper */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRegionId(region.id);
                                  setEditingLabel(region.label || '');
                                }}
                                className={`w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-brand hover:bg-brand/10 transition-all cursor-pointer bg-transparent border-none ${region.id === selectedRegionId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                title="Chỉnh sửa tên"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteRegion(region.id); }}
                                className={`w-6 h-6 rounded flex items-center justify-center text-danger hover:bg-danger/10 transition-all cursor-pointer bg-transparent border-none ${region.id === selectedRegionId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                title="Xóa vùng"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-text-muted">
                      <span>x:{Math.round(region.x)} y:{Math.round(region.y)}</span>
                      <span>{Math.round(region.width)}×{Math.round(region.height)}</span>
                    </div>
                    {region.taskId ? (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Tag size={10} className="text-info" />
                        <span className="text-[10px] text-info">Đã gán task</span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRegion(region.id);
                          setShowCreateTask(true);
                        }}
                        className="mt-1.5 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand/10 text-brand text-[10px] font-medium hover:bg-brand/20 transition-colors border-none cursor-pointer"
                      >
                        <Plus size={10} />
                        Tạo Task
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={() => {
            setShowCreateTask(false);
            toast.success('Task đã được tạo từ Region!');
          }}
          initialContext={
            chapterDetail && currentPage
              ? {
                  seriesId: chapterDetail.seriesId,
                  chapterId: chapterDetail.id,
                  pageId: currentPage.id,
                  taskName: regions.find((r: Region) => r.id === selectedRegionId)?.label || '',
                  regionId: selectedRegionId || undefined,
                }
              : { seriesId: '', chapterId: '', pageId: '', taskName: '' }
          }
        />
      )}
    </>
  );
};
