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
  SquareDashedBottom,
  Trash2,
  ArrowLeft,
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
  CheckCircle2,
  MapPin,
  Upload,
  Eye,
  EyeOff,
  Wand2,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";

import { useSegmentImage } from "../../ai/hooks/useSegmentImage";
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
  useMarkPageReady,
  useUnmarkPageReady,
  useAnnotations,
  useDeleteAnnotation,
} from "../hooks/useCanvasData";
import {
  useCompositedPageUrl,
  useMangakaTasks,
} from "../../tasks/hooks/useTasks";
import { useChapterDetail, ReplacePageImageModal, useReplacePageImage, getPageStatusConfig } from "../../series";
import { getTaskStatusConfig } from "../../tasks";
import { AnimatedModal } from "../../../components/common/animation/AnimatedModal";
import { CreateTaskModal } from "../../tasks";
import { formatVND } from "../../wallet";
import type { CanvasAnnotation, CanvasRegion, CanvasPage } from "../types/canvas.types";
import { ANNOTATION_TYPE_CONFIG } from '../../../constants/annotation';
import type { TasksDto } from "../../../api/generated/types";
import type { CanvasViewerHandle } from "../../../components/canvas/CanvasViewer";
import { AnimatePresence, motion } from "framer-motion";
import { canvasPageVariants, canvasShellTransition } from "../../../components/common/animation";

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

const CanvasThumbnail = ({
  page,
  isActive,
  activeThumbUrl,
  onClick,
}: {
  page: CanvasPage;
  isActive: boolean;
  activeThumbUrl?: string | null;
  onClick: () => void;
}) => {
  const cfg = getPageStatusConfig(page.status);
  const useLive = !!page.compositeImageUrl || page.status === 'InProgress' || page.status === 'Completed';
  
  // Lấy ảnh gộp live trực tiếp nếu là trang không active nhưng cần live (active page lấy từ parent)
  const { data: liveUrl } = useCompositedPageUrl(!isActive && useLive ? page.id : undefined);

  const thumbUrl = isActive && activeThumbUrl
    ? activeThumbUrl
    : liveUrl || page.compositeImageUrl || page.imageUrl;

  return (
    <button
      onClick={onClick}
      className={`group relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
        isActive ? 'border-brand shadow-brand' : 'border-border-custom/60 hover:border-brand/40'
      }`}
      title={`Trang ${page.pageNumber}`}
    >
      {thumbUrl ? (
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
      )}
      <div className="absolute top-1 left-1 w-5 h-5 rounded bg-black/65 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white">
        {page.pageNumber}
      </div>
      <span
        className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${cfg.dotColor} ring-2 ring-black/40`}
      />
    </button>
  );
};

interface PageCanvasFeatureProps {
  chapterId?: string;
}

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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editingLabel, setEditingLabel] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showReplaceImage, setShowReplaceImage] = useState(false);
  const [showRegions, setShowRegions] = useState(true);
  const [pinToResolve, setPinToResolve] = useState<string | null>(null);

  const {
    activeTool,
    zoomLevel,
    selectedRegionId,
    selectedAnnotationId,
    setActiveTool,
    setZoomLevel,
    setSelectedRegion,
    setSelectedAnnotation,
  } = useCanvasStore();

  // ─── Data ───
  const { data: chapterDetail } = useChapterDetail(chapterId);
  const { data: pages = [], isLoading: pagesLoading } =
    useCanvasPages(chapterId);
  const currentPage = pages[currentPageIndex];
  const pageId = currentPage?.id ?? "";

  const { data: regions = [] } = useRegions(pageId);
  const { data: editorAnnotations = [] } = useAnnotations(pageId);
  const { data: mangakaTasks = [] } = useMangakaTasks({ pageSize: 200 });
  
  const useLive = currentPage
    ? !!currentPage.compositeImageUrl ||
      currentPage.status === 'InProgress' ||
      currentPage.status === 'Completed'
    : false;

  const {
    data: compositedUrl,
    isFetching: isCompositeLoading,
  } = useCompositedPageUrl(useLive ? pageId : undefined);
  const markPageReady = useMarkPageReady(chapterId);
  const unmarkPageReady = useUnmarkPageReady(chapterId);
  const replacePageImage = useReplacePageImage(chapterId);

  const createRegion = useCreateRegion(pageId);
  const updateRegion = useUpdateRegion(pageId);
  const deleteRegion = useDeleteRegion(pageId);
  const deleteAnnotation = useDeleteAnnotation(pageId);
  
  const { mutateAsync: segmentImage, isPending: isSegmenting } = useSegmentImage();

  const handleAISegment = async () => {
    // Luôn ưu tiên dùng currentPage?.imageUrl (URL thật trên server) để gửi cho AI
    // Không dùng compositedUrl vì nó có thể là blob url (không thể gọi từ API python)
    let imageUrl = currentPage?.imageUrl;
    if (!imageUrl) {
      toast.error("Không tìm thấy ảnh trang");
      return;
    }
    
    // Nếu imageUrl là đường dẫn tương đối (bắt đầu bằng /), chuyển thành đường dẫn tuyệt đối có domain của Vite
    // Để server Python có thể dùng requests.get tải ảnh qua Vite proxy
    if (imageUrl.startsWith('/')) {
      imageUrl = `${window.location.origin}${imageUrl}`;
    }
    
    try {
      const detectedRegions = await segmentImage(imageUrl);
      if (!detectedRegions || detectedRegions.length === 0) {
        toast.error("AI không nhận diện được khung tranh nào.");
        return;
      }
      
      let successCount = 0;
      for (const [x, y, w, h] of detectedRegions) {
        await createRegion.mutateAsync({
          pageId,
          x,
          y,
          width: w,
          height: h,
          label: `Khung ${successCount + 1}`
        });
        successCount++;
      }
      
      toast.success(`Đã tự động tạo ${successCount} vùng tranh!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi nhận diện khung tranh");
    }
  };

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

  // ─── Region handlers ───
  const handleRegionCreated = useCallback(
    (region: Omit<CanvasRegion, "id" | "createdAt" | "updatedAt">) => {
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
      const current = regions.find((r: CanvasRegion) => r.id === regionId);
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
    (region: CanvasRegion) => {
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
    setSelectedAnnotation(null);
    setActiveTool("select");
    setEditingRegionId(null);
    setRegionLabel("");
    setRegionLabelError(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pageId, setSelectedRegion, setSelectedAnnotation, setActiveTool]);

  // Đồng bộ annotation với trang hiện tại:
  // - nếu annotation đang chọn không còn tồn tại thì bỏ chọn
  // - nếu trang có lỗi mà chưa chọn gì thì tự chọn lỗi đầu tiên
  useEffect(() => {
    if (!pageId) return;
    if (editorAnnotations.length === 0) {
      if (selectedAnnotationId) setSelectedAnnotation(null);
      return;
    }

    const hasSelected = selectedAnnotationId
      ? editorAnnotations.some((a) => a.id === selectedAnnotationId)
      : false;

    if (!hasSelected) {
      setSelectedAnnotation(editorAnnotations[0]?.id ?? null);
    }
  }, [pageId, editorAnnotations, selectedAnnotationId, setSelectedAnnotation]);

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

  const isPageCompleted = currentPage?.status === 'Completed';
  
  const allTasksDone = regions.length > 0 && regions.every(r => {
    const task = tasksByRegion.get(r.id);
    return task?.status && ['Approved', 'Closed', 'Cancelled'].includes(task.status);
  });

  const canMarkPageReady =
    !!pageId && !!currentPage && !isPageCompleted && (regions.length === 0 || allTasksDone);

  const handleMarkPageReady = () => {
    if (!canMarkPageReady) return;
    markPageReady.mutate(pageId);
  };

  const handleUnmarkPageReady = () => {
    unmarkPageReady.mutate(pageId);
  };

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
      <motion.div
        className="flex flex-col items-center justify-center py-20 gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={canvasShellTransition}
      >
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
      </motion.div>
    );
  }

  const statusConfig = getPageStatusConfig(currentPage.status);

  const isDrawingTool = activeTool === "region";

  return (
    <>
      <MobileCanvasWarning />
      <motion.div
        className="hidden md:flex flex-col gap-3 h-[calc(100vh-100px)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={canvasShellTransition}
      >
        {/* ═══ Top bar ═══ */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0 bg-bg-secondary border border-border-custom rounded-xl px-4 py-2.5 overflow-x-auto hide-scrollbar">
          {/* Left: back + page info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(`/mangaka/manuscripts/${chapterId}`)}
              className="w-9 h-9 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors cursor-pointer flex-shrink-0"
              title="Quay lại Chapter"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0 flex items-center gap-2">
              <h2 className="text-[13px] font-bold text-text-primary whitespace-nowrap">
                {chapterDetail ? `Chương ${chapterDetail.chapterNumber}` : "Trang canvas"}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${statusConfig.bg} ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
              {editorAnnotations.length > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400">
                  {editorAnnotations.length} lỗi Editor
                </span>
              )}
            </div>
          </div>

          {/* Center: tools */}
          <div className="flex items-center gap-1 rounded-2xl bg-bg-primary/90 border border-border-custom shadow-lg px-2 py-1.5 overflow-x-auto min-w-0 hide-scrollbar">
            <ToolButton
              active={activeTool === "select"}
              title="Chọn (V)"
              onClick={() => setActiveTool("select")}
            >
              <MousePointer2 size={16} />
            </ToolButton>
            <ToolButton
              active={activeTool === "region"}
              title="Khoanh vùng thủ công (R)"
              onClick={() => setActiveTool("region")}
            >
              <SquareDashedBottom size={16} />
            </ToolButton>
            <div className="w-px h-5 bg-border-custom mx-0.5" />
            <button
              type="button"
              onClick={handleAISegment}
              disabled={isSegmenting || isPageCompleted}
              className={`min-w-[2.25rem] h-8 rounded-lg flex items-center justify-center gap-1.5 px-2 text-[11px] font-medium transition-colors border-none cursor-pointer ${
                isPageCompleted ? 'bg-bg-surface text-text-muted opacity-50 cursor-not-allowed' :
                'text-brand bg-brand/10 hover:bg-brand/20'
              }`}
              title="AI tự động nhận diện & cắt khung tranh"
            >
              <Wand2 size={14} className={isSegmenting ? "animate-pulse" : ""} />
              <span className="hidden lg:inline">{isSegmenting ? "Đang quét..." : "AI Phân vùng"}</span>
            </button>
            <div className="w-px h-5 bg-border-custom mx-0.5" />
            <ToolButton
              active={activeTool === "pan"}
              title="Di chuyển (Space)"
              onClick={() => setActiveTool("pan")}
            >
              <Hand size={16} />
            </ToolButton>
            <div className="w-px h-5 bg-border-custom mx-0.5" />
            <ToolButton title="Thu nhỏ" onClick={handleZoomOut}>
              <ZoomOut size={16} />
            </ToolButton>
            <button
              type="button"
              onClick={handleZoomFit}
              title="Vừa khung hình"
              className="min-w-[3rem] h-8 rounded-lg px-1.5 text-[11px] font-medium text-text-primary hover:bg-bg-surface transition-colors tabular-nums cursor-pointer bg-transparent border-none"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <ToolButton title="Phóng to" onClick={handleZoomIn}>
              <ZoomIn size={16} />
            </ToolButton>
            <ToolButton title="Vừa khung hình" onClick={handleZoomFit}>
              <Maximize2 size={16} />
            </ToolButton>
            <div className="w-px h-5 bg-border-custom mx-0.5" />
            <ToolButton
              active={!showRegions}
              title={showRegions ? "Ẩn khung vùng vẽ" : "Hiện khung vùng vẽ"}
              onClick={() => setShowRegions(!showRegions)}
            >
              {showRegions ? <Eye size={16} /> : <EyeOff size={16} />}
            </ToolButton>
            {selectedRegionId && !tasksByRegion.has(selectedRegionId) && (
              <>
                <div className="w-px h-5 bg-border-custom mx-0.5" />
                <ToolButton
                  title="Xoá vùng đã chọn (Delete)"
                  onClick={() => handleDeleteRegion(selectedRegionId)}
                  danger
                >
                  <Trash2 size={16} />
                </ToolButton>
              </>
            )}
          </div>

          {/* Right: composite + page nav */}
          <div className="flex items-center gap-2">
            {canMarkPageReady && (
              <button
                type="button"
                onClick={handleMarkPageReady}
                disabled={markPageReady.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 whitespace-nowrap hover:bg-emerald-600/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title={regions.length === 0 ? "Trang upload đã xong — không cần vẽ vùng hay giao Assistant" : "Đánh dấu trang đã hoàn thiện sau khi gộp lớp Assistant"}
              >
                {markPageReady.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Đánh dấu sẵn sàng
              </button>
            )}
            {isPageCompleted && (
              <button
                type="button"
                onClick={handleUnmarkPageReady}
                disabled={unmarkPageReady.isPending}
                title="Bỏ đánh dấu sẵn sàng để tiếp tục vẽ vùng hoặc giao task"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 hover:bg-danger/10 border border-success/20 hover:border-danger/30 text-[11px] font-semibold text-success hover:text-danger whitespace-nowrap transition-colors cursor-pointer group"
              >
                {unmarkPageReady.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} className="group-hover:hidden" />
                )}
                <span className="group-hover:hidden">Đã sẵn sàng</span>
                <span className="hidden group-hover:inline">Bỏ đánh dấu</span>
              </button>
            )}
            <div 
              className="relative"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setShowMoreMenu(false);
                }
              }}
            >
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-primary transition-colors cursor-pointer"
                title="Tùy chọn khác"
              >
                <MoreVertical size={16} />
              </button>
              
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-bg-primary border border-border-custom rounded-lg shadow-lg z-50 flex flex-col overflow-hidden py-1">
                  {hasCompositeOverlay && (
                    <a
                      href={canvasImageUrl}
                      download={`trang-${currentPage.pageNumber}-composite.png`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setShowMoreMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-bg-surface transition-colors no-underline"
                      title="Tải file PNG trang đã gộp lớp Assistant"
                    >
                      <Download size={14} className="text-text-muted" /> Tải ảnh
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setShowReplaceImage(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-bg-surface transition-colors cursor-pointer text-left w-full border-none bg-transparent"
                    title="Tải lại ảnh trang hiện tại sau khi sửa ngoài Canvas"
                  >
                    <Upload size={14} className="text-text-muted" /> Tải lại ảnh
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {editorAnnotations.length > 0 && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 shrink-0">
            <MapPin size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <p>
              Editor đã ghim <strong className="text-amber-300">{editorAnnotations.length} lỗi</strong> trên
              trang này. Click ghim trên ảnh hoặc mục bên phải để xem vị trí và mô tả cần sửa.
            </p>
          </div>
        )}

        {/* ═══ Main area: filmstrip + canvas + sidebar ═══ */}
        <div className="flex gap-3 flex-1 min-h-0 min-w-0">
          {/* ── Page filmstrip ── */}
          <div className="w-24 flex-shrink-0 bg-bg-secondary border border-border-custom rounded-xl flex flex-col">
            <div className="px-2 py-2.5 border-b border-border-custom text-center">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Trang
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {pages.map((page, idx) => {
                const isActive = idx === currentPageIndex;
                return (
                  <CanvasThumbnail
                    key={page.id}
                    page={page}
                    isActive={isActive}
                    activeThumbUrl={compositedUrl}
                    onClick={() => setCurrentPageIndex(idx)}
                  />
                );
              })}
            </div>
          </div>

          {/* ── Canvas ── */}
          <div className="flex-1 relative bg-bg-secondary border border-border-custom rounded-xl overflow-hidden min-h-0">
            {(isCompositeLoading && !compositedUrl) ? (
              <div className="h-full w-full flex flex-col items-center justify-center bg-bg-surface">
                <Loader2 size={32} className="animate-spin text-brand mb-2" />
                <span className="text-sm text-text-muted">Đang tải ảnh trang...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={pageId}
                  className="w-full h-full"
                  variants={canvasPageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
              <CanvasViewer
                ref={canvasRef}
              imageUrl={canvasImageUrl}
              regions={showRegions ? regions : []}
              annotations={editorAnnotations}
              mode={activeTool === "select" ? "view" : activeTool}
              onRegionCreated={handleRegionCreated}
              onRegionUpdated={handleRegionUpdated}
              selectedRegionId={selectedRegionId}
              onRegionSelect={setSelectedRegion}
              selectedAnnotationId={selectedAnnotationId}
              onAnnotationSelect={setSelectedAnnotation}
              onZoomChange={setZoomLevel}
              showRegionCoords
              className="w-full h-full"
            />
                </motion.div>
              </AnimatePresence>
            )}

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
              {editorAnnotations.length > 0 && (
                <div className="mb-3 pb-3 border-b border-amber-500/15 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-amber-400" />
                    <p className="text-[11px] font-semibold text-text-primary">
                      Lỗi Editor ghim ({editorAnnotations.length})
                    </p>
                  </div>
                  {editorAnnotations.map((anno: CanvasAnnotation) => {
                    const cfg = ANNOTATION_TYPE_CONFIG[anno.type];
                    const isSelected = anno.id === selectedAnnotationId;
                    return (
                      <div
                        key={anno.id}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                          isSelected
                            ? "border-amber-400/50 bg-amber-500/10"
                            : "border-border-custom/50 bg-bg-primary hover:border-amber-400/30"
                        }`}
                      >
                        <div
                          onClick={() =>
                            setSelectedAnnotation(isSelected ? null : anno.id)
                          }
                          className="cursor-pointer"
                        >
                          <span className={`text-[10px] font-medium ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                          <p className="text-[11px] text-text-primary mt-1 leading-snug">
                            {anno.comment}
                          </p>
                          <p className="text-[9px] text-text-muted mt-1">
                            {anno.editorName || "Editor"}
                          </p>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-2 pt-2 border-t border-amber-500/20 flex gap-1.5 overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => setPinToResolve(anno.id)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-success/10 border border-success/30 text-success hover:bg-success hover:text-white text-[10px] font-medium transition-colors cursor-pointer"
                              title="Xóa ghim sau khi đã sửa xong lỗi"
                            >
                              <Check size={12} />
                              Đã sửa xong
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowReplaceImage(true)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-brand text-white text-[10px] font-semibold hover:bg-brand-hover transition-colors border-none cursor-pointer"
                              title="Tải lên ảnh trang đã sửa để thay thế"
                            >
                              <Upload size={12} />
                              Sửa ảnh
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTool("region")}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-bg-surface border border-border-custom text-text-secondary hover:text-text-primary hover:border-brand/40 text-[10px] font-medium transition-colors cursor-pointer"
                              title="Khoanh vùng vị trí lỗi để giao việc cho Assistant"
                            >
                              <SquareDashedBottom size={12} />
                              Khoanh vùng
                            </button>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                  <div className="rounded-lg border border-brand/20 bg-brand/5 p-2.5 space-y-2">
                    <p className="text-[10px] font-semibold text-text-primary">Cách xử lý</p>
                    <ol className="text-[10px] text-text-secondary space-y-1 list-decimal list-inside leading-relaxed">
                      <li>
                        <span className="text-text-primary font-medium">Tự sửa (khuyến nghị):</span> chỉnh file
                        ngoài → tải lại ảnh trang → <span className="text-emerald-400">Đánh dấu sẵn sàng</span>
                      </li>
                      <li>
                        <span className="text-text-primary font-medium">Nhờ Assistant:</span> chỉ khi phần lỗi cần
                        trợ lý vẽ lại — khoanh vùng rồi giao việc
                      </li>
                    </ol>
                    <button
                      type="button"
                      onClick={() => setShowReplaceImage(true)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium bg-brand/10 border border-brand/25 text-brand hover:bg-brand/20 transition-colors cursor-pointer"
                    >
                      <Upload size={11} />
                      Tải lại ảnh trang này
                    </button>
                  </div>
                </div>
              )}

              {regions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4 text-text-muted">
                  <SquareDashedBottom size={28} />
                  {isPageCompleted ? (
                    <p className="text-xs text-center px-4 text-success">
                      Trang này đã được đánh dấu sẵn sàng — không cần sản xuất thêm.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-center px-4">
                        {editorAnnotations.length > 0 ? (
                          <>
                            Bạn có thể <b className="text-text-secondary">tự sửa file</b> rồi đánh dấu sẵn sàng,
                            hoặc khoanh vùng để giao Assistant nếu cần trợ lý vẽ lại.
                          </>
                        ) : (
                          <>
                            Chưa có vùng nào.
                            <br />
                            Nếu ảnh upload đã hoàn chỉnh, bấm{" "}
                            <b className="text-text-secondary">Đánh dấu sẵn sàng</b> thay vì khoanh vùng.
                          </>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={handleMarkPageReady}
                        disabled={markPageReady.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white border-none cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {markPageReady.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        Đánh dấu sẵn sàng
                      </button>
                    </>
                  )}
                </div>
              ) : (
                regions.map((region: CanvasRegion, idx: number) => {
                  const task = tasksByRegion.get(region.id);
                  const isSelected = region.id == selectedRegionId;
                  const taskCfg = task ? getTaskStatusConfig(task.status) : null;
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
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${taskCfg.bg} ${taskCfg.color}`}
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
      </motion.div>

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
                  seriesId: String(chapterDetail.seriesId ?? ''),
                  chapterId: String(chapterDetail.id ?? ''),
                  pageId: currentPage.id,
                  taskName:
                    regions.find((r: CanvasRegion) => r.id == selectedRegionId)
                      ?.label || "",
                  regionId: selectedRegionId || undefined,
                }
              : { seriesId: "", chapterId: "", pageId: "", taskName: "" }
          }
        />
      )}

      {showReplaceImage && currentPage && (
        <ReplacePageImageModal
          page={currentPage}
          isSubmitting={replacePageImage.isPending}
          onClose={() => setShowReplaceImage(false)}
          onSubmit={(file) => {
            replacePageImage.mutate(
              { pageId: currentPage.id, file },
              {
                onSuccess: () => {
                  setShowReplaceImage(false);
                },
              },
            );
          }}
        />
      )}

      {pinToResolve && (
        <AnimatedModal
          open={!!pinToResolve}
          onClose={() => setPinToResolve(null)}
          panelClassName="bg-bg-primary border border-border-custom w-full max-w-sm rounded-xl p-5 shadow-xl"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success mb-4">
              <Check size={24} />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">Đã sửa xong lỗi này?</h3>
            <p className="text-sm text-text-secondary mb-6">
              Điểm ghim lỗi này sẽ được xóa khỏi trang. Bạn có chắc chắn không?
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setPinToResolve(null)}
                className="flex-1 py-2 rounded-lg font-medium text-sm border border-border-custom text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAnnotation.mutate(pinToResolve);
                  setPinToResolve(null);
                }}
                disabled={deleteAnnotation.isPending}
                className="flex-1 py-2 rounded-lg font-bold text-sm bg-success text-white hover:bg-green-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {deleteAnnotation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Xác nhận'}
              </button>
            </div>
          </div>
        </AnimatedModal>
      )}
    </>
  );
};

