import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  SquareDashedBottom,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  UserPlus,
  Pencil,
  Check,
  X,
  Loader2,
  Download,
  MousePointer2,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAxiosErrorMessage } from "../../../api/axios";
import { CanvasViewer } from "../../../components/canvas/CanvasViewer";
import { MobileCanvasWarning } from "../../../components/canvas/MobileCanvasWarning";
import { useCanvasStore } from "../../../stores/canvasStore";
import {
  useRegions,
  useCreateRegion,
  useDeleteRegion,
  useUpdateRegion,
  useCanvasPages,
} from "../hooks/useCanvasData";
import {
  useCompositedPageUrl,
  useRefreshPageComposite,
  useMangakaTasks,
} from "../../tasks/hooks/useTasks";
import { useChapterDetail } from "../../series";
import { CreateTaskModal } from "../../tasks";
import { formatVND } from "../../wallet";
import type { Region } from "../../../types/entities";
import type { TasksDto } from "../../../api/generated/types";
import type { CanvasViewerHandle } from "../../../components/canvas/CanvasViewer";

interface PageCanvasFeatureProps {
  chapterId?: string;
}

const PAGE_STATUS_COLORS: Record<
  string,
  { dot: string; bg: string; text: string; label: string }
> = {
  Pending: {
    dot: "bg-text-muted",
    bg: "bg-text-muted/10",
    text: "text-text-muted",
    label: "Chờ xử lý",
  },
  InProgress: {
    dot: "bg-info",
    bg: "bg-info/10",
    text: "text-info",
    label: "Đang làm",
  },
  Completed: {
    dot: "bg-success",
    bg: "bg-success/10",
    text: "text-success",
    label: "Hoàn thành",
  },
  NeedsRevision: {
    dot: "bg-warning",
    bg: "bg-warning/10",
    text: "text-warning",
    label: "Cần sửa",
  },
};

const TASK_STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  Pending: { bg: "bg-info/10", text: "text-info", label: "Chờ nhận" },
  In_Progress: { bg: "bg-info/10", text: "text-info", label: "Đang làm" },
  Pending_Review: {
    bg: "bg-warning/10",
    text: "text-warning",
    label: "Chờ duyệt",
  },
  Revision: { bg: "bg-warning/10", text: "text-warning", label: "Cần sửa" },
  Approved: { bg: "bg-success/10", text: "text-success", label: "Đã duyệt" },
  Disputed: { bg: "bg-danger/10", text: "text-danger", label: "Tranh chấp" },
  Cancelled: {
    bg: "bg-text-muted/10",
    text: "text-text-muted",
    label: "Đã hủy",
  },
  Closed: { bg: "bg-text-muted/10", text: "text-text-muted", label: "Đã đóng" },
};

export const PageCanvasFeature = ({
  chapterId = "1",
}: PageCanvasFeatureProps) => {
  const navigate = useNavigate();
  const canvasRef = useRef<CanvasViewerHandle>(null);

  // ─── Local UI state ───
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [regionLabel, setRegionLabel] = useState("");
  const [regionLabelError, setRegionLabelError] = useState(false);
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);

  const {
    activeTool,
    zoomLevel,
    selectedRegionId,
    setActiveTool,
    setZoomLevel,
    setSelectedRegion,
  } = useCanvasStore();

  // ─── Data ───
  const { data: chapterDetail } = useChapterDetail(chapterId);
  const { data: pages = [], isLoading: pagesLoading } =
    useCanvasPages(chapterId);
  const currentPage = pages[currentPageIndex];
  const pageId = currentPage?.id ?? "";

  const { data: regions = [] } = useRegions(pageId);
  const { data: mangakaTasks = [] } = useMangakaTasks({ pageSize: 200 });
  const {
    data: compositedUrl,
    refetch: refetchComposite,
    isFetching: isCompositeLoading,
  } = useCompositedPageUrl(pageId);
  const refreshComposite = useRefreshPageComposite();

  const createRegion = useCreateRegion(pageId);
  const updateRegion = useUpdateRegion(pageId);
  const deleteRegion = useDeleteRegion(pageId);

  // Map regionId → task (a region corresponds to a task assigned to an assistant).
  const tasksByRegion = useMemo(() => {
    const map = new Map<string, TasksDto>();
    mangakaTasks.forEach((t) => {
      if (t.regionId != null) map.set(String(t.regionId), t);
    });
    return map;
  }, [mangakaTasks]);

  // Always prefer the live composited image (DB compositeImageUrl can be stale).
  const canvasImageUrl = compositedUrl || currentPage?.imageUrl || "";
  const hasCompositeOverlay =
    !!compositedUrl && canvasImageUrl !== currentPage?.imageUrl;

  // ─── Composite refresh ───
  const handleRefreshComposite = useCallback(() => {
    if (!pageId) return;
    refreshComposite.mutate(pageId, {
      onSuccess: () => {
        toast.success("Đã làm mới ảnh gộp trang");
        void refetchComposite();
      },
      onError: (err) =>
        toast.error(getAxiosErrorMessage(err, "Không thể làm mới ảnh gộp")),
    });
  }, [pageId, refreshComposite, refetchComposite]);

  // ─── Region handlers ───
  const handleRegionCreated = useCallback(
    (region: Omit<Region, "id" | "createdAt" | "updatedAt">) => {
      if (!regionLabel.trim()) {
        toast.error("Vui lòng nhập tên vùng trước khi vẽ.");
        setRegionLabelError(true);
        return;
      }
      createRegion.mutate(
        {
          pageId,
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height,
          label: regionLabel.trim(),
        },
        {
          onSuccess: (res) => {
            toast.success("Đã tạo vùng — bạn có thể giao việc cho Assistant.");
            setRegionLabel("");
            setRegionLabelError(false);
            setActiveTool("select");
            const newRegion = res.data?.data as
              | { id?: number | string }
              | undefined;
            if (newRegion?.id != null) setSelectedRegion(String(newRegion.id));
          },
          onError: (error) =>
            toast.error(
              getAxiosErrorMessage(
                error,
                "Không thể tạo vùng. Vui lòng thử lại.",
              ),
            ),
        },
      );
    },
    [pageId, regionLabel, createRegion, setActiveTool, setSelectedRegion],
  );

  const handleUpdateLabel = useCallback(
    (regionId: string, newLabel: string) => {
      const current = regions.find((r: Region) => r.id === regionId);
      updateRegion.mutate(
        {
          regionId,
          data: {
            label: newLabel,
            ...(current
              ? {
                  x: current.x,
                  y: current.y,
                  width: current.width,
                  height: current.height,
                }
              : {}),
          },
        },
        {
          onSuccess: () => {
            toast.success("Đã cập nhật tên vùng.");
            setEditingRegionId(null);
          },
          onError: (error) =>
            toast.error(
              getAxiosErrorMessage(error, "Không thể cập nhật tên vùng."),
            ),
        },
      );
    },
    [updateRegion, regions],
  );

  const handleRegionUpdated = useCallback(
    (region: Region) => {
      updateRegion.mutate(
        {
          regionId: region.id,
          data: {
            label: region.label,
            x: region.x,
            y: region.y,
            width: region.width,
            height: region.height,
          },
        },
        {
          onSuccess: () => toast.success("Đã cập nhật vị trí vùng."),
          onError: (error) =>
            toast.error(
              getAxiosErrorMessage(error, "Không thể cập nhật vùng."),
            ),
        },
      );
    },
    [updateRegion],
  );

  const handleDeleteRegion = useCallback(
    (regionId: string) => {
      if (tasksByRegion.has(regionId)) {
        toast.error("Vùng này đã được giao việc — không thể xoá.");
        return;
      }
      deleteRegion.mutate(regionId, {
        onSuccess: () => {
          toast.success("Đã xoá vùng.");
          setSelectedRegion(null);
        },
        onError: (error) =>
          toast.error(getAxiosErrorMessage(error, "Không thể xoá vùng.")),
      });
    },
    [deleteRegion, setSelectedRegion, tasksByRegion],
  );

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedRegionId) {
        handleDeleteRegion(selectedRegionId);
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "v") setActiveTool("select");
      if (key === "r") setActiveTool("region");
      if (e.code === "Space") {
        e.preventDefault();
        setActiveTool("pan");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRegionId, handleDeleteRegion, setActiveTool]);

  // Reset transient state when switching pages.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- intentional reset when pageId changes */
    setSelectedRegion(null);
    setActiveTool("select");
    setEditingRegionId(null);
    setRegionLabel("");
    setRegionLabelError(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pageId, setSelectedRegion, setActiveTool]);

  // ─── Zoom handlers (zoom là tương đối: 100% = trang vừa khít khung) ───
  const handleZoomIn = useCallback(() => {
    canvasRef.current?.zoomBy(1.25);
  }, []);

  const handleZoomOut = useCallback(() => {
    canvasRef.current?.zoomBy(1 / 1.25);
  }, []);

  const handleZoomFit = useCallback(() => {
    canvasRef.current?.resetView();
  }, []);

  // ─── Loading skeleton ───
  if (pagesLoading) {
    return (
      <div className="hidden md:flex flex-col gap-3 h-[calc(100vh-120px)] animate-pulse mt-4">
        <div className="h-14 rounded-xl bg-bg-secondary border border-border-custom" />
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="flex-1 bg-bg-secondary border border-border-custom rounded-xl flex flex-col items-center justify-center">
            <Loader2
              size={40}
              className="animate-spin text-brand opacity-60 mb-4"
            />
            <span className="text-sm font-medium text-text-muted">
              Đang tải Canvas & dữ liệu trang…
            </span>
          </div>
          <div className="w-80 flex-shrink-0 bg-bg-secondary border border-border-custom rounded-xl" />
        </div>
      </div>
    );
  }

  // ─── Empty state ───
  if (!currentPage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <ImageOff size={48} className="text-text-muted" />
        <p className="text-text-secondary">
          Chapter này chưa có trang nào để chỉnh sửa.
        </p>
        <button
          onClick={() => navigate(`/mangaka/manuscripts/${chapterId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-hover transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} /> Quay lại & tải ảnh trang lên
        </button>
      </div>
    );
  }

  const statusConfig =
    PAGE_STATUS_COLORS[currentPage.status] ?? PAGE_STATUS_COLORS.Pending;
  const assignedCount = regions.filter((r: Region) =>
    tasksByRegion.has(r.id),
  ).length;
  const isDrawingTool = activeTool === "region";

  return (
    <>
      <MobileCanvasWarning />
      <div className="hidden md:flex flex-col gap-3 animate-fade-in h-[calc(100vh-100px)]">
        {/* ═══ Top bar ═══ */}
        <div className="flex items-center justify-between flex-shrink-0 bg-bg-secondary border border-border-custom rounded-xl px-4 py-2.5">
          {/* Left: back + page info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(`/mangaka/manuscripts/${chapterId}`)}
              className="w-9 h-9 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors cursor-pointer flex-shrink-0"
              title="Quay lại Chapter"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-text-primary truncate">
                {chapterDetail ? `Ch.${chapterDetail.chapterNumber} · ` : ""}
                Trang {currentPage.pageNumber} / {pages.length}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}
                >
                  {statusConfig.label}
                </span>
                <span className="text-[10px] text-text-muted">
                  {regions.length} vùng · {assignedCount} đã giao việc
                </span>
              </div>
            </div>
          </div>

          {/* Center: tools */}
          <div className="flex items-center gap-1 rounded-2xl bg-bg-primary/90 border border-border-custom shadow-lg px-2 py-1.5">
            <ToolButton
              active={activeTool === "select"}
              title="Chọn (V)"
              onClick={() => setActiveTool("select")}
            >
              <MousePointer2 size={18} />
            </ToolButton>
            <ToolButton
              active={activeTool === "region"}
              title="Khoanh vùng (R)"
              onClick={() => setActiveTool("region")}
            >
              <SquareDashedBottom size={18} />
            </ToolButton>
            <ToolButton
              active={activeTool === "pan"}
              title="Di chuyển (Space)"
              onClick={() => setActiveTool("pan")}
            >
              <Hand size={18} />
            </ToolButton>
            <div className="w-px h-6 bg-border-custom mx-1" />
            <ToolButton title="Thu nhỏ" onClick={handleZoomOut}>
              <ZoomOut size={18} />
            </ToolButton>
            <button
              type="button"
              onClick={handleZoomFit}
              title="Vừa khung hình"
              className="min-w-[3.25rem] h-9 rounded-xl px-2 text-xs font-medium text-text-primary hover:bg-bg-surface transition-colors tabular-nums cursor-pointer bg-transparent border-none"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <ToolButton title="Phóng to" onClick={handleZoomIn}>
              <ZoomIn size={18} />
            </ToolButton>
            <ToolButton title="Vừa khung hình" onClick={handleZoomFit}>
              <Maximize2 size={18} />
            </ToolButton>
            {selectedRegionId && !tasksByRegion.has(selectedRegionId) && (
              <>
                <div className="w-px h-6 bg-border-custom mx-1" />
                <ToolButton
                  title="Xoá vùng đã chọn (Delete)"
                  onClick={() => handleDeleteRegion(selectedRegionId)}
                  danger
                >
                  <Trash2 size={18} />
                </ToolButton>
              </>
            )}
          </div>

          {/* Right: composite + page nav */}
          <div className="flex items-center gap-2">
            {hasCompositeOverlay && (
              <a
                href={canvasImageUrl}
                download={`trang-${currentPage.pageNumber}-composite.png`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/20 text-[11px] font-semibold text-brand hover:bg-brand/20 transition-colors no-underline"
                title="Tải file PNG trang đã gộp lớp Assistant"
              >
                <Download size={14} /> Tải ảnh
              </a>
            )}
            <button
              type="button"
              onClick={handleRefreshComposite}
              disabled={
                !pageId || refreshComposite.isPending || isCompositeLoading
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-primary border border-border-custom text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:border-brand/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Tạo lại ảnh gộp từ các Task đã duyệt"
            >
              {refreshComposite.isPending || isCompositeLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Layers size={14} />
              )}
              Làm mới ảnh gộp
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setCurrentPageIndex(Math.max(0, currentPageIndex - 1))
                }
                disabled={currentPageIndex === 0}
                className="w-8 h-8 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-mono text-text-secondary min-w-[52px] text-center">
                {currentPageIndex + 1} / {pages.length}
              </span>
              <button
                onClick={() =>
                  setCurrentPageIndex(
                    Math.min(pages.length - 1, currentPageIndex + 1),
                  )
                }
                disabled={currentPageIndex === pages.length - 1}
                className="w-8 h-8 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ Main area: filmstrip + canvas + sidebar ═══ */}
        <div className="flex gap-3 flex-1 min-h-0">
          {/* ── Page filmstrip ── */}
          <div className="w-24 flex-shrink-0 bg-bg-secondary border border-border-custom rounded-xl flex flex-col">
            <div className="px-2 py-2.5 border-b border-border-custom text-center">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Trang
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {pages.map((page, idx) => {
                const cfg =
                  PAGE_STATUS_COLORS[page.status] ?? PAGE_STATUS_COLORS.Pending;
                const isActive = idx === currentPageIndex;
                return (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPageIndex(idx)}
                    className={`group relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-brand shadow-brand"
                        : "border-border-custom/60 hover:border-brand/40"
                    }`}
                    title={`Trang ${page.pageNumber}`}
                  >
                    {(() => {
                      const thumbUrl =
                        idx === currentPageIndex && compositedUrl
                          ? compositedUrl
                          : page.compositeImageUrl || page.imageUrl;
                      return thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={`Trang ${page.pageNumber}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-bg-primary">
                        <ImageOff size={16} className="text-text-muted" />
                      </div>
                    );
                    })()}
                    <div className="absolute top-1 left-1 w-5 h-5 rounded bg-black/65 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white">
                      {page.pageNumber}
                    </div>
                    <span
                      className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${cfg.dot} ring-2 ring-black/40`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Canvas ── */}
          <div className="flex-1 relative bg-bg-secondary border border-border-custom rounded-xl overflow-hidden min-h-0">
            <CanvasViewer
              ref={canvasRef}
              key={pageId}
              imageUrl={canvasImageUrl}
              regions={regions}
              mode={activeTool === "select" ? "view" : activeTool}
              onRegionCreated={handleRegionCreated}
              onRegionUpdated={handleRegionUpdated}
              selectedRegionId={selectedRegionId}
              onRegionSelect={setSelectedRegion}
              onZoomChange={setZoomLevel}
              showRegionCoords
              className="w-full h-full"
            />

            {/* Region-name prompt overlay while drawing */}
            {isDrawingTool && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(420px,90%)]">
                <div className="bg-bg-surface/95 backdrop-blur-md border border-brand/40 rounded-xl shadow-lg p-3">
                  <label className="text-[10px] text-text-muted mb-1 block">
                    Tên vùng <span className="text-danger">*</span> — nhập rồi
                    kéo chuột để khoanh vùng trên trang
                  </label>
                  <input
                    type="text"
                    value={regionLabel}
                    onChange={(e) => {
                      setRegionLabel(e.target.value);
                      if (e.target.value.trim()) setRegionLabelError(false);
                    }}
                    placeholder="VD: Nền bầu trời, Tô bóng nhân vật…"
                    autoFocus
                    className={`w-full px-3 py-2 text-sm bg-bg-primary border rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none transition-colors ${
                      regionLabelError
                        ? "border-danger focus:border-danger"
                        : "border-border-custom focus:border-brand/50"
                    }`}
                  />
                  {regionLabelError && (
                    <p className="text-[10px] text-danger mt-1">
                      Vui lòng nhập tên vùng trước khi vẽ.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Region / Task sidebar ── */}
          <div className="w-80 flex-shrink-0 bg-bg-secondary border border-border-custom rounded-xl flex flex-col">
            <div className="p-4 border-b border-border-custom">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <SquareDashedBottom size={14} className="text-brand" />
                Vùng & Công việc
              </h3>
              <p className="text-[11px] text-text-muted mt-1">
                Mỗi vùng tương ứng một Task giao cho Assistant.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {regions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-text-muted">
                  <SquareDashedBottom size={28} />
                  <p className="text-xs text-center px-4">
                    Chưa có vùng nào.
                    <br />
                    Chọn công cụ{" "}
                    <b className="text-text-secondary">Khoanh vùng</b> rồi kéo
                    chuột trên trang để tạo.
                  </p>
                </div>
              ) : (
                regions.map((region: Region, idx: number) => {
                  const task = tasksByRegion.get(region.id);
                  const isSelected = region.id === selectedRegionId;
                  const taskCfg = task
                    ? (TASK_STATUS_CONFIG[task.status ?? "Pending"] ??
                      TASK_STATUS_CONFIG.Pending)
                    : null;
                  return (
                    <div
                      key={region.id}
                      onClick={() =>
                        setSelectedRegion(isSelected ? null : region.id)
                      }
                      className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand/50 bg-brand/5"
                          : "border-border-custom/50 bg-bg-primary hover:border-brand/20"
                      }`}
                    >
                      {/* Header row */}
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-brand/10 flex items-center justify-center text-[10px] font-bold text-brand flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          {editingRegionId === region.id ? (
                            <div
                              className="flex items-center gap-1 w-full"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editingLabel}
                                onChange={(e) =>
                                  setEditingLabel(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleUpdateLabel(region.id, editingLabel);
                                  if (e.key === "Escape")
                                    setEditingRegionId(null);
                                }}
                                autoFocus
                                className="flex-1 text-xs px-2 py-1 bg-bg-surface border border-brand/50 rounded-md outline-none text-text-primary focus:border-brand"
                              />
                              <button
                                onClick={() =>
                                  handleUpdateLabel(region.id, editingLabel)
                                }
                                className="w-6 h-6 flex justify-center items-center rounded bg-brand/10 text-brand hover:bg-brand/20 transition-colors border-none cursor-pointer"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => setEditingRegionId(null)}
                                className="w-6 h-6 flex justify-center items-center rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors border-none cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="truncate text-xs font-medium text-text-primary group-hover:text-brand transition-colors">
                                {region.label || `Vùng ${idx + 1}`}
                              </div>
                              <div className="flex items-center gap-1">
                                {!task && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingRegionId(region.id);
                                      setEditingLabel(region.label || "");
                                    }}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-text-secondary hover:text-brand hover:bg-brand/10 transition-all cursor-pointer bg-transparent border-none ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                    title="Đổi tên vùng"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                )}
                                {!task && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRegion(region.id);
                                    }}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-danger hover:bg-danger/10 transition-all cursor-pointer bg-transparent border-none ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                    title="Xoá vùng"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Coordinates */}
                      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-text-muted font-mono">
                        <span>
                          x:{Math.round(region.x)} y:{Math.round(region.y)}
                        </span>
                        <span>
                          {Math.round(region.width)}×{Math.round(region.height)}
                        </span>
                      </div>

                      {/* Task association */}
                      {task && taskCfg ? (
                        <div className="mt-2 pt-2 border-t border-border-custom/60 space-y-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${taskCfg.bg} ${taskCfg.text}`}
                            >
                              {taskCfg.label}
                            </span>
                            <span className="text-[10px] font-semibold text-text-secondary">
                              {formatVND(task.paymentAmount ?? 0)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-text-muted">
                            <span className="truncate">
                              {task.assistantName
                                ? `👤 ${task.assistantName}`
                                : "Chờ Assistant nhận"}
                            </span>
                            {task.deadline && (
                              <span className="inline-flex items-center gap-0.5">
                                <Clock size={9} />
                                {new Date(task.deadline).toLocaleDateString(
                                  "vi-VN",
                                  { day: "2-digit", month: "2-digit" },
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRegion(region.id);
                            setShowCreateTask(true);
                          }}
                          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-brand/10 text-brand text-[11px] font-semibold hover:bg-brand/20 transition-colors border-none cursor-pointer"
                        >
                          <UserPlus size={12} />
                          Giao việc cho Assistant
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task modal */}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={() => {
            setShowCreateTask(false);
            toast.success("Đã đăng Task từ vùng đã chọn!");
          }}
          initialContext={
            chapterDetail && currentPage
              ? {
                  seriesId: chapterDetail.seriesId,
                  chapterId: chapterDetail.id,
                  pageId: currentPage.id,
                  taskName:
                    regions.find((r: Region) => r.id === selectedRegionId)
                      ?.label || "",
                  regionId: selectedRegionId || undefined,
                }
              : { seriesId: "", chapterId: "", pageId: "", taskName: "" }
          }
        />
      )}
    </>
  );
};

// ─── Small tool button ───────────────────────────────────────

interface ToolButtonProps {
  active?: boolean;
  danger?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}

const ToolButton = ({
  active,
  danger,
  title,
  onClick,
  children,
}: ToolButtonProps) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 border-none cursor-pointer ${
      danger
        ? "text-danger hover:bg-danger/10 bg-transparent"
        : active
          ? "bg-brand text-white shadow-lg shadow-brand/25"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-surface bg-transparent"
    }`}
  >
    {children}
  </button>
);
