import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft, MapPin, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Loader2, ImageOff,
  RotateCcw, CheckCircle2, AlertCircle, Banknote, Send, X,
  ClipboardCheck, Ban, Minus, Plus, Layers, User, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CanvasViewer } from '../../../components/canvas/CanvasViewer';
import { CanvasToolbar } from '../../../components/canvas/CanvasToolbar';
import { AnnotationPinPanel } from '../../../components/canvas/AnnotationPinPanel';
import { MobileCanvasWarning } from '../../../components/canvas/MobileCanvasWarning';
import { useCanvasStore } from '../../../stores/canvasStore';
import type { CanvasViewerHandle } from '../../../components/canvas/CanvasViewer';
import type { AnnotationType } from '../../../types/status.types';
import type { CanvasAnnotation } from '../../canvas/types/canvas.types';
import { useChapterReview, useApproveChapter, useRequireChapterRevision } from '../hooks/useReview';
import { reviewApi, type AnnotationDto } from '../api/review.api';
import { ANNOTATION_TYPE_CONFIG, QC_CHECKLIST_ITEMS, formatVND } from '../constants';
import { HelpTip } from '../../../components/common/HelpTip';
import type { PageDto } from '../../../api/generated/types';
import { Point } from 'fabric';

interface ChapterQCReviewProps {
  chapterId: string;
  onBack: () => void;
}

export const ChapterQCReview = ({ chapterId, onBack }: ChapterQCReviewProps) => {
  const { data: chapter, isLoading } = useChapterReview(chapterId);

  const approveChapter = useApproveChapter();
  const requireRevision = useRequireChapterRevision();

  const {
    activeTool, zoomLevel, annotationType, selectedAnnotationId,
    setActiveTool, setZoomLevel, setAnnotationType, setSelectedAnnotation, resetCanvas,
  } = useCanvasStore();

  const [annotations, setAnnotations] = useState<CanvasAnnotation[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [annoComment, setAnnoComment] = useState('');
  const [showApprove, setShowApprove] = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [manualValidPageCount, setManualValidPageCount] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<boolean[]>(QC_CHECKLIST_ITEMS.map(() => false));
  const canvasRef = useRef<CanvasViewerHandle>(null);
  const revisionTemplates = [
    'Bố cục khung hình chưa rõ điểm nhấn, cần cân lại bố cục.',
    'Chi tiết biểu cảm và cử chỉ nhân vật chưa khớp nội dung thoại.',
    'Hiệu ứng ánh sáng/bóng đổ chưa đồng nhất giữa các trang.',
  ];

  const toAnnotationEntity = useCallback((dto: AnnotationDto): CanvasAnnotation => {
    const coords = (() => {
      try {
        const parsed = JSON.parse(dto.coordinatesJson ?? '{}') as {
          x?: number | string;
          y?: number | string;
          left?: number | string;
          top?: number | string;
        };
        const toNum = (v: number | string | undefined): number =>
          typeof v === 'number' ? v : Number(v ?? 0);
        return {
          x: Number.isFinite(toNum(parsed.left))
            ? toNum(parsed.left)
            : Number.isFinite(toNum(parsed.x))
              ? toNum(parsed.x)
              : 0,
          y: Number.isFinite(toNum(parsed.top))
            ? toNum(parsed.top)
            : Number.isFinite(toNum(parsed.y))
              ? toNum(parsed.y)
              : 0,
        };
      } catch {
        return { x: 0, y: 0 };
      }
    })();

    const rawType = String(dto.type ?? '');
    const normalizedType: AnnotationType = rawType === 'Art' || rawType === 'Content' ? rawType : 'Technical';

    return {
      id: String(dto.id ?? `anno-${Date.now()}`),
      pageId: String(dto.pageId ?? ''),
      editorId: String(dto.createdByUserId ?? '0'),
      editorName: dto.createdByUserName || 'Biên tập viên',
      type: normalizedType,
      x: coords.x,
      y: coords.y,
      comment: dto.comment ?? '',
      resolved: false,
      createdAt: dto.createAt || new Date().toISOString(),
      updatedAt: dto.updateAt || dto.createAt || new Date().toISOString(),
    };
  }, []);

  // Seed annotations from the loaded chapter data once.
  const seededRef = useRef<string | null>(null);


  useEffect(() => {
    if (seededRef.current === chapterId) return;
    const raw = chapter as Record<string, unknown> | undefined;
    const annos = (raw?.Annotations ?? raw?.annotations) as Record<string, unknown>[] | undefined;
    if (!chapter || !annos) return;
    seededRef.current = chapterId;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time seed from server data
    setAnnotations(annos.map((a) => ({
      id: String(a.Id),
      pageId: String(a.PageId),
      editorId: String(a.EditorId),
      editorName: (a.Editor as Record<string, string>)?.FullName || 'Biên tập viên',
      type: a.Type as AnnotationType,
      x: a.X as number,
      y: a.Y as number,
      comment: a.Comment as string,
      resolved: a.Resolved as boolean,
      createdAt: (a.CreateAt as string) || new Date().toISOString(),
      updatedAt: (a.UpdateAt as string) || new Date().toISOString(),
    })));
  }, [chapter, chapterId]);

  // Reset canvas tool state when leaving.
  useEffect(() => () => resetCanvas(), [resetCanvas]);

  const pages = useMemo(() => chapter?.pages ?? [], [chapter?.pages]);
  const currentPage = pages[currentPageIndex];
  const pageId = String(currentPage?.id ?? '');

  useEffect(() => {
    if (!pages.length) return;
    let cancelled = false;

    const loadChapterAnnotations = async () => {
      try {
        const list = await Promise.all(
          pages.map(async (p: PageDto) => {
            const pid = String(p.id ?? '');
            if (!pid) return [] as CanvasAnnotation[];
            const res = await reviewApi.listAnnotations({ pageId: pid });
            const rows = res.data?.data ?? [];
            return rows.map(toAnnotationEntity);
          }),
        );
        if (!cancelled) {
          setAnnotations(list.flat());
        }
      } catch {
        // keep seeded data from chapter detail as a fallback if annotation API fails
      }
    };

    void loadChapterAnnotations();
    return () => {
      cancelled = true;
    };
  }, [pages, toAnnotationEntity]);

  const pageAnnotations = useMemo(
    () => annotations.filter((a) => a.pageId === pageId),
    [annotations, pageId],
  );

  // F3.2 — a page with any unresolved error annotation is Invalid.
  const pageHasError = useCallback(
    (pid: string) => annotations.some((a) => a.pageId === pid && !a.resolved),
    [annotations],
  );

  const autoValidPageCount = useMemo(
    () => pages.filter((p: PageDto) => !pageHasError(String(p.id))).length,
    [pages, pageHasError],
  );
  
  const validPageCount = manualValidPageCount !== null ? manualValidPageCount : autoValidPageCount;

  const genkouryoUnitPrice = chapter?.appliedGenkouryoPrice ?? 0;
  const genkouryo = validPageCount * genkouryoUnitPrice;
  const totalUnresolved = annotations.filter((a) => !a.resolved).length;
  const invalidPageCount = pages.length - validPageCount;
  const reviewProgress = pages.length > 0 ? Math.round((validPageCount / pages.length) * 100) : 0;
  const unresolvedAnnotations = useMemo(
    () => annotations.filter((a) => !a.resolved),
    [annotations],
  );
  const autoRevisionSummary = useMemo(() => {
    if (!unresolvedAnnotations.length) return '';
    const byPage = new Map<string, CanvasAnnotation[]>();
    unresolvedAnnotations.forEach((a) => {
      const list = byPage.get(a.pageId) ?? [];
      list.push(a);
      byPage.set(a.pageId, list);
    });

    const lines = Array.from(byPage.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([pid, list]) => {
        const page = pages.find((p: PageDto) => String(p.id) === pid);
        const pageNo = page?.pageNumber ?? pid;
        const topIssues = list.slice(0, 2).map((item) => item.comment).filter(Boolean);
        const suffix = list.length > 2 ? ` (+${list.length - 2} lỗi khác)` : '';
        return `- Trang ${pageNo}: ${topIssues.join('; ')}${suffix}`;
      });

    return `Vui lòng chỉnh sửa theo các lỗi đã ghim:\n${lines.join('\n')}`.slice(0, 500);
  }, [pages, unresolvedAnnotations]);

  const openRevisionModal = useCallback(() => {
    setShowRevision(true);
    setRevisionReason((current) => current.trim() || autoRevisionSummary || '');
  }, [autoRevisionSummary]);

  // ─── Handlers ───
  const handleCreate = useCallback(
    async (data: { x: number; y: number; type: AnnotationType; comment: string }) => {
      if (!data.comment.trim()) {
        toast.error('Vui lòng nhập nội dung lỗi trước khi ghim');
        return;
      }
      if (!pageId) {
        toast.error('Không xác định được trang để ghim lỗi');
        return;
      }
      try {
        const created = await reviewApi.createAnnotation({
          pageId,
          x: data.x,
          y: data.y,
          comment: data.comment.trim(),
          type: data.type,
        });
        const saved = created.data?.data ? toAnnotationEntity(created.data.data) : null;
        if (saved) {
          setAnnotations((prev) => [...prev, saved]);
        }
        setAnnoComment('');
        toast.success(`Đã ghim ${ANNOTATION_TYPE_CONFIG[data.type].label}`);
      } catch {
        toast.error('Không thể lưu ghim lỗi. Vui lòng thử lại.');
      }
    },
    [pageId, toAnnotationEntity],
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await reviewApi.deleteAnnotation(id);
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
      setSelectedAnnotation(null);
    } catch {
      toast.error('Không thể xoá ghim lỗi');
    }
  }, [setSelectedAnnotation]);

  const handleToggleResolved = useCallback((id: string) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: !a.resolved } : a)),
    );
  }, []);

  const handleApprove = () => {
    const qcChecklist = QC_CHECKLIST_ITEMS.reduce<Record<string, boolean>>((acc, label, index) => {
      acc[label] = checklist[index] ?? false;
      return acc;
    }, {});

    approveChapter.mutate(
      { chapterId, validPageCount, genkouryo, qcChecklist },
      {
        onSuccess: () => {
          toast.success(`Đã duyệt chương · Giải ngân ${formatVND(genkouryo)} nhuận bút`, { duration: 4000 });
          setShowApprove(false);
          onBack();
        },
        onError: () => toast.error('Có lỗi khi duyệt chương'),
      },
    );
  };

  const handleRevision = () => {
    const finalReason = revisionReason.trim() || autoRevisionSummary.trim();
    if (!finalReason) {
      toast.error('Vui lòng nhập lý do yêu cầu sửa');
      return;
    }
    requireRevision.mutate(
      { chapterId, reason: finalReason },
      {
        onSuccess: () => {
          toast.success('Đã trả chương về cho Mangaka chỉnh sửa');
          setShowRevision(false);
          onBack();
        },
        onError: () => toast.error('Có lỗi khi gửi yêu cầu sửa'),
      },
    );
  };

  const handleApplyRevisionTemplate = (template: string) => {
    setRevisionReason((prev) => (prev.trim() ? `${prev.trim()}\n- ${template}`.slice(0, 500) : `- ${template}`));
  };

  const handleZoomIn = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      let zoom = canvas.getZoom();
      zoom = Math.min(zoom * 1.1, 5);
      // Zoom center
      canvas.zoomToPoint(new Point(canvas.getWidth() / 2, canvas.getHeight() / 2), zoom);
      setZoomLevel(zoom);
      canvas.renderAll();
    }
  }, [setZoomLevel]);

  const handleZoomOut = useCallback(() => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      let zoom = canvas.getZoom();
      zoom = Math.max(zoom * 0.9, 0.1);
      canvas.zoomToPoint(new Point(canvas.getWidth() / 2, canvas.getHeight() / 2), zoom);
      setZoomLevel(zoom);
      canvas.renderAll();
    }
  }, [setZoomLevel]);

  const handleZoomReset = useCallback(() => {
    canvasRef.current?.resetView();
  }, []);

  const handleZoomFit = useCallback(() => {
    canvasRef.current?.resetView();
  }, []);

  const startPinning = useCallback(() => {
    setActiveTool('annotate');
  }, [setActiveTool]);

  const allChecked = checklist.every(Boolean);
  const checklistDoneCount = checklist.filter(Boolean).length;
  const checklistTotal = QC_CHECKLIST_ITEMS.length;
  const isManualPageCount = manualValidPageCount !== null;
  const canDisburse = genkouryoUnitPrice > 0 && validPageCount > 0;

  useEffect(() => {
    if (!showApprove) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowApprove(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showApprove]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ImageOff size={48} className="text-text-muted" />
        <p className="text-text-secondary">Không tìm thấy chương để kiểm duyệt</p>
        <button onClick={onBack} className="text-brand text-sm hover:underline cursor-pointer">
          ← Quay lại hàng đợi
        </button>
      </div>
    );
  }

  return (
    <>
      <MobileCanvasWarning />
      <div className="hidden md:flex flex-col gap-3 animate-fade-in h-[calc(100vh-100px)]">
        {/* ─── Compact header ─── */}
        <div className="flex items-center justify-between flex-shrink-0 gap-3 bg-bg-secondary border border-border-custom rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors cursor-pointer flex-shrink-0"
              title="Quay lại hàng đợi"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-text-primary truncate">
                {chapter.series?.title || `Bộ truyện #${chapter.seriesId}`} · Chương {chapter.chapterNumber}
              </h1>
              <p className="text-[11px] text-text-secondary truncate">
                {chapter.title} — {chapter.series?.mangaka?.fullName || 'Chưa xác định'}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-primary border border-border-custom">
              <div className="w-16 h-1 rounded-full bg-bg-surface overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand to-success transition-all duration-300"
                  style={{ width: `${reviewProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-text-secondary tabular-nums">{reviewProgress}%</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 border border-success/20 text-[10px] font-semibold text-success">
              <CheckCircle2 size={11} />
              {validPageCount}/{pages.length} hợp lệ
            </span>
            {invalidPageCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-danger/10 border border-danger/20 text-[10px] font-semibold text-danger">
                <AlertCircle size={11} />
                {invalidPageCount} cần sửa
              </span>
            )}
            {totalUnresolved > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-400">
                <MapPin size={11} />
                {totalUnresolved} lỗi mở
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-primary border border-border-custom text-[10px] font-medium text-text-secondary">
              <Banknote size={11} className="text-success" />
              {formatVND(genkouryo)}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={openRevisionModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-primary border border-border-custom rounded-lg text-xs text-text-secondary hover:text-text-primary hover:border-amber-500/30 transition-all cursor-pointer"
            >
              <RotateCcw size={13} /> Yêu cầu sửa
            </button>
            <button
              onClick={() => setShowApprove(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-xs font-medium shadow-brand transition-all cursor-pointer"
            >
              <CheckCircle2 size={13} /> Duyệt chương
            </button>
          </div>
        </div>

        {/* ─── Workspace ─── */}
        <div className="flex gap-3 flex-1 min-h-0">
          {/* Page filmstrip — vertical */}
          <div className="w-[76px] flex-shrink-0 flex flex-col gap-1.5 overflow-hidden">
            <p className="text-[9px] uppercase tracking-wider text-text-muted font-medium text-center shrink-0">
              Trang
            </p>
            {/* Nút điều hướng lên */}
            <button
              onClick={() => {
                const target = Math.max(0, currentPageIndex - 1);
                setCurrentPageIndex(target);
              }}
              disabled={currentPageIndex === 0}
              className="w-full h-6 rounded-md bg-bg-secondary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all flex-shrink-0"
            >
              <ChevronUp size={14} />
            </button>
            {/* Hiển thị tối đa 6 trang xung quanh trang hiện tại */}
            {(() => {
              const maxVisible = 6;
              let start = Math.max(0, currentPageIndex - Math.floor(maxVisible / 2));
              const end = Math.min(pages.length, start + maxVisible);
              if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
              const visiblePages = pages.slice(start, end);
              const hasHiddenAbove = start > 0;
              const hasHiddenBelow = end < pages.length;
              return (
                <>
                  {hasHiddenAbove && (
                    <div className="text-center">
                      <span className="text-[8px] text-text-muted font-medium">+{start} trang</span>
                    </div>
                  )}
                  {visiblePages.map((p: PageDto, localIdx: number) => {
                    const globalIdx = start + localIdx;
                    const invalid = pageHasError(String(p.id));
                    const isActive = globalIdx === currentPageIndex;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setCurrentPageIndex(globalIdx)}
                        className={`relative flex-shrink-0 w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${
                          isActive
                            ? 'border-brand ring-2 ring-brand/20 scale-[1.02]'
                            : 'border-border-custom/50 hover:border-border-custom'
                        }`}
                        title={`Trang ${p.pageNumber} — ${invalid ? 'Cần sửa' : 'Hợp lệ'}`}
                      >
                        <img
                          src={p.compositeImageUrl || p.rawImageUrl || ''}
                          alt={`Trang ${p.pageNumber}`}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute top-1 right-1 w-2 h-2 rounded-full border border-bg-secondary ${
                            invalid ? 'bg-danger' : 'bg-success'
                          }`}
                        />
                        <span
                          className={`absolute bottom-0 inset-x-0 text-[10px] font-semibold text-center py-0.5 ${
                            isActive ? 'bg-brand/90 text-white' : 'bg-black/60 text-white/90'
                          }`}
                        >
                          {p.pageNumber}
                        </span>
                      </button>
                    );
                  })}
                  {hasHiddenBelow && (
                    <div className="text-center">
                      <span className="text-[8px] text-text-muted font-medium">+{pages.length - end} trang</span>
                    </div>
                  )}
                </>
              );
            })()}
            {/* Nút điều hướng xuống */}
            <button
              onClick={() => {
                const target = Math.min(pages.length - 1, currentPageIndex + 1);
                setCurrentPageIndex(target);
              }}
              disabled={currentPageIndex === pages.length - 1}
              className="w-full h-6 rounded-md bg-bg-secondary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all flex-shrink-0"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Canvas column */}
          <div className="flex flex-col flex-1 min-w-0 gap-0 bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border-custom bg-bg-secondary flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                    pageHasError(pageId)
                      ? 'bg-danger/10 text-danger border border-danger/20'
                      : 'bg-success/10 text-success border border-success/20'
                  }`}
                >
                  {pageHasError(pageId) ? 'Cần sửa' : 'Hợp lệ'}
                </span>
                <span className="text-[11px] text-text-secondary truncate">
                  Trang {currentPage?.pageNumber} · {pageAnnotations.length} ghim
                </span>
              </div>

              <CanvasToolbar
                activeTool={activeTool}
                zoomLevel={zoomLevel}
                onToolChange={setActiveTool}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
                onZoomFit={handleZoomFit}
                showRegionTool={false}
                showAnnotateTool
                variant="docked"
                canDelete={!!selectedAnnotationId}
                onDelete={() => {
                  if (selectedAnnotationId) {
                    void handleDelete(selectedAnnotationId);
                  }
                }}
              />

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                  disabled={currentPageIndex === 0}
                  className="w-8 h-8 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="text-[11px] font-mono text-text-secondary min-w-[48px] text-center tabular-nums">
                  {currentPageIndex + 1}/{pages.length}
                </span>
                <button
                  onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                  disabled={currentPageIndex === pages.length - 1}
                  className="w-8 h-8 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="flex-1 relative min-h-0 bg-bg-primary/40">
              {currentPage && (
                <CanvasViewer
                  ref={canvasRef}
                  key={currentPage.id}
                  imageUrl={currentPage.compositeImageUrl || currentPage.rawImageUrl || ''}
                  annotations={pageAnnotations}
                  mode={activeTool === 'annotate' ? 'annotate' : 'view'}
                  onAnnotationCreated={(data) =>
                    handleCreate({ ...data, type: annotationType, comment: annoComment })
                  }
                  selectedAnnotationId={selectedAnnotationId}
                  onAnnotationSelect={setSelectedAnnotation}
                  onZoomChange={setZoomLevel}
                  className="w-full h-full"
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[300px] xl:w-[320px] flex-shrink-0 flex flex-col gap-3 min-h-0">
            {/* QC summary — compact */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <ClipboardCheck size={13} className="text-brand" />
                  Tổng kết kiểm duyệt
                </h3>
                <span className="text-[10px] text-text-muted lg:hidden">{reviewProgress}%</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="rounded-lg bg-bg-primary border border-success/15 p-2 text-center">
                  <p className="text-base font-bold text-success leading-none">{validPageCount}</p>
                  <p className="text-[9px] text-text-secondary mt-0.5">Hợp lệ</p>
                </div>
                <div className="rounded-lg bg-bg-primary border border-danger/15 p-2 text-center">
                  <p className="text-base font-bold text-danger leading-none">{invalidPageCount}</p>
                  <p className="text-[9px] text-text-secondary mt-0.5">Cần sửa</p>
                </div>
                <div className="rounded-lg bg-bg-primary border border-amber-500/15 p-2 text-center">
                  <p className="text-base font-bold text-amber-400 leading-none">{totalUnresolved}</p>
                  <p className="text-[9px] text-text-secondary mt-0.5">Lỗi mở</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between px-2 py-1.5 rounded-lg bg-success/5 border border-success/15">
                <span className="text-[10px] text-text-secondary">Nhuận bút dự kiến</span>
                <span className="text-xs font-bold text-success">{formatVND(genkouryo)}</span>
              </div>
            </div>

            <AnnotationPinPanel
              contextLabel={`Trang ${currentPage?.pageNumber ?? '?'}`}
              annotations={pageAnnotations.map((a) => ({
                id: a.id,
                type: a.type,
                comment: a.comment,
                resolved: a.resolved,
                meta: a.editorName,
              }))}
              annotationType={annotationType}
              onAnnotationTypeChange={setAnnotationType}
              comment={annoComment}
              onCommentChange={setAnnoComment}
              isPinningActive={activeTool === 'annotate'}
              onStartPinning={startPinning}
              selectedId={selectedAnnotationId}
              onSelect={setSelectedAnnotation}
              onDelete={(id) => { void handleDelete(id); }}
              onToggleResolved={handleToggleResolved}
              showResolvedToggle
            />
          </div>
        </div>
      </div>

      {/* ─── Approve Modal (F3.6) ─── */}
      {showApprove && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-chapter-title"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowApprove(false)} />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-4xl max-h-[min(90vh,720px)] flex flex-col animate-modal-enter">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-border-custom shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} className="text-success" />
                </div>
                <div className="min-w-0">
                  <h3 id="approve-chapter-title" className="text-base font-semibold text-text-primary">
                    Duyệt chương & Giải ngân
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {chapter.series?.title || `Bộ #${chapter.seriesId}`} · Chương {chapter.chapterNumber}
                  </p>
                  <p className="text-[11px] text-text-secondary truncate mt-0.5">
                    {chapter.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApprove(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface cursor-pointer bg-transparent border-none shrink-0"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                
                {/* ─── LEFT COLUMN: CHECKLIST ─── */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <ClipboardCheck size={16} className="text-text-muted shrink-0" />
                      <p className="text-xs uppercase tracking-wider text-text-muted font-semibold">
                        Danh mục kiểm tra (bắt buộc)
                      </p>
                      <HelpTip 
                        title="Lưu ý quan trọng"
                        content="Tất cả các hạng mục trong checklist này phải được kiểm tra và đánh dấu tích chọn thì nút Giải Ngân mới có thể được kích hoạt."
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-bold tabular-nums px-2.5 py-0.5 rounded-full ${
                        allChecked ? 'bg-success/10 text-success' : 'bg-bg-surface text-text-muted border border-border-custom'
                      }`}>
                        {checklistDoneCount}/{checklistTotal}
                      </span>
                      {!allChecked && (
                        <button
                          type="button"
                          onClick={() => setChecklist(QC_CHECKLIST_ITEMS.map(() => true))}
                          className="text-xs font-medium text-brand hover:text-brand-hover cursor-pointer bg-transparent border-none px-1"
                        >
                          Chọn tất cả
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-1.5 rounded-full bg-bg-surface overflow-hidden mb-4 border border-border-custom/50">
                    <div
                      className="h-full bg-gradient-to-r from-brand to-success transition-all duration-300"
                      style={{ width: `${(checklistDoneCount / checklistTotal) * 100}%` }}
                    />
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    {QC_CHECKLIST_ITEMS.map((item, idx) => {
                      const isChecked = checklist[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setChecklist((prev) => prev.map((v, i) => (i === idx ? !v : v)))
                          }
                          className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${
                            isChecked
                              ? 'bg-success/10 border-success/30 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                              : 'bg-bg-surface border-border-custom hover:border-text-muted/30'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110">
                            {isChecked ? (
                              <CheckCircle2 size={18} className="text-success" />
                            ) : (
                              <div className="w-4 h-4 mt-0.5 rounded-full border border-border-custom bg-bg-primary" />
                            )}
                          </div>
                          <span className={`text-[13px] leading-relaxed mt-0.5 ${
                            isChecked ? 'text-success font-semibold' : 'text-text-secondary'
                          }`}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ─── RIGHT COLUMN: DETAILS & CALCULATION ─── */}
                <div className="flex flex-col space-y-6">
                  {/* Chapter summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-bg-surface border border-border-custom rounded-xl px-4 py-3">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold flex items-center gap-1.5">
                        <User size={12} /> Mangaka
                      </p>
                      <p className="text-sm font-semibold text-text-primary mt-1.5 truncate">
                        {chapter.series?.mangaka?.fullName || 'Chưa xác định'}
                      </p>
                    </div>
                    <div className="bg-bg-surface border border-border-custom rounded-xl px-4 py-3">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold flex items-center gap-1.5">
                        <Layers size={12} /> Tiến độ QC
                      </p>
                      <p className="text-sm font-semibold text-text-primary mt-1.5">
                        {validPageCount}/{pages.length} trang hợp lệ
                      </p>
                    </div>
                  </div>

                  {totalUnresolved > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                      <AlertCircle size={18} className="text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-400">Còn lỗi chưa xử lý</p>
                        <p className="text-xs text-amber-400/90 mt-1 leading-relaxed">
                          {totalUnresolved} ghim lỗi mở → {invalidPageCount} trang không được tính nhuận bút.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Disbursement calculator */}
                  <div className="bg-bg-surface border border-border-custom rounded-xl p-5 space-y-4 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">Số trang hợp lệ</span>
                      <div className="flex items-center gap-2">
                        {isManualPageCount && (
                          <button
                            type="button"
                            onClick={() => setManualValidPageCount(null)}
                            className="text-[11px] font-semibold text-brand hover:text-brand-hover cursor-pointer bg-transparent border-none mr-2"
                          >
                            Tự động tính
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setManualValidPageCount(Math.max(0, validPageCount - 1))}
                          disabled={validPageCount <= 0}
                          className="w-7 h-7 rounded-md bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <div className="min-w-[4.5rem] text-center">
                          <span className="text-base font-bold text-text-primary tabular-nums">{validPageCount}</span>
                          <span className="text-xs text-text-muted ml-0.5">/ {pages.length}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setManualValidPageCount(Math.min(pages.length, validPageCount + 1))}
                          disabled={validPageCount >= pages.length}
                          className="w-7 h-7 rounded-md bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">Đơn giá nhuận bút</span>
                      <span className="font-bold text-text-primary tabular-nums">
                        {formatVND(genkouryoUnitPrice)}
                        <span className="text-text-muted font-normal text-xs"> /trang</span>
                      </span>
                    </div>

                    {genkouryoUnitPrice === 0 && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <AlertCircle size={15} className="text-warning mt-0.5 shrink-0" />
                        <p className="text-xs text-warning leading-relaxed font-medium">
                          Chưa lấy được đơn giá từ hợp đồng. Vui lòng kiểm tra lại.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-border-custom">
                      <span className="text-sm text-text-secondary font-bold uppercase tracking-wider">
                        Tổng giải ngân
                      </span>
                      <span className={`text-2xl font-black tabular-nums ${
                        canDisburse ? 'text-success drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'text-text-muted'
                      }`}>
                        {formatVND(genkouryo)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer — sticky */}
            <div className="shrink-0 border-t border-border-custom p-5 bg-bg-secondary/95 backdrop-blur-sm rounded-b-2xl">
              {!allChecked && (
                <p className="text-[11px] text-text-muted mb-3 flex items-center gap-1.5">
                  <FileText size={12} />
                  Còn {checklistTotal - checklistDoneCount} mục checklist chưa hoàn thành
                </p>
              )}
              {allChecked && genkouryoUnitPrice === 0 && (
                <p className="text-[11px] text-warning mb-3 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  Không thể giải ngân khi chưa có đơn giá hợp đồng
                </p>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApprove(false)}
                  className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={!allChecked || approveChapter.isPending || genkouryoUnitPrice === 0}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-none transition-all ${
                    !allChecked || approveChapter.isPending || genkouryoUnitPrice === 0
                      ? 'bg-success/40 text-white/60 cursor-not-allowed'
                      : 'bg-success hover:brightness-110 text-white cursor-pointer shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                  }`}
                >
                  {approveChapter.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Duyệt & Giải ngân {canDisburse ? `· ${formatVND(genkouryo)}` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* ─── Revision Modal ─── */}
      {showRevision && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRevision(false)} />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Ban size={16} className="text-amber-400" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">Yêu cầu sửa chương</h3>
              </div>
              <button onClick={() => setShowRevision(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface cursor-pointer bg-transparent border-none">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-text-secondary">
                Chương sẽ được trả về cho <span className="text-text-primary font-medium">{chapter.series?.mangaka?.fullName || 'Chưa xác định'}</span> kèm {totalUnresolved} lỗi đã ghim để chỉnh sửa.
              </p>
              {unresolvedAnnotations.length > 0 && (
                <div className="rounded-xl border border-border-custom bg-bg-surface p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-text-primary">
                      Lỗi đã ghim ({unresolvedAnnotations.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => setRevisionReason(autoRevisionSummary)}
                      className="text-[11px] text-brand hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Dùng tóm tắt tự động
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-[11px] text-text-secondary">
                    {unresolvedAnnotations.slice(0, 6).map((item) => {
                      const page = pages.find((p: PageDto) => String(p.id) === item.pageId);
                      return (
                        <li key={item.id} className="leading-4">
                          • Trang {page?.pageNumber ?? item.pageId}: {item.comment}
                        </li>
                      );
                    })}
                    {unresolvedAnnotations.length > 6 && (
                      <li className="text-text-muted">• ... và {unresolvedAnnotations.length - 6} lỗi khác</li>
                    )}
                  </ul>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Lý do / Tóm tắt yêu cầu sửa {unresolvedAnnotations.length === 0 && <span className="text-danger">*</span>}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {revisionTemplates.map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => handleApplyRevisionTemplate(template)}
                      className="px-2 py-1 text-[10px] rounded-md border border-border-custom bg-bg-primary hover:border-brand/30 text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      + {template.slice(0, 26)}...
                    </button>
                  ))}
                </div>
                <textarea
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder={unresolvedAnnotations.length > 0
                    ? 'Có thể chỉnh lại tóm tắt tự động trước khi gửi...'
                    : 'Tóm tắt các điểm cần Mangaka xử lý...'}
                  rows={4}
                  className="w-full px-4 py-3 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 resize-none"
                  maxLength={500}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleRevision();
                  }}
                />
                <p className="text-[10px] text-text-muted mt-1 text-right">{revisionReason.length}/500</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button onClick={() => setShowRevision(false)} className="px-4 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary cursor-pointer">
                Hủy
              </button>
              <button
                onClick={handleRevision}
                disabled={requireRevision.isPending}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border-none transition-all ${requireRevision.isPending
                    ? 'bg-amber-500/50 text-white/70 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                  }`}
              >
                {requireRevision.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
