import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft, MapPin, ChevronLeft, ChevronRight, Loader2, ImageOff,
  Trash2, RotateCcw, CheckCircle2, AlertCircle, Banknote, Send, X,
  ClipboardCheck, Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CanvasViewer } from '../../../components/canvas/CanvasViewer';
import { CanvasToolbar } from '../../../components/canvas/CanvasToolbar';
import { MobileCanvasWarning } from '../../../components/canvas/MobileCanvasWarning';
import { useCanvasStore } from '../../../stores/canvasStore';
import type { CanvasViewerHandle } from '../../../components/canvas/CanvasViewer';
import { useAuthStore } from '../../../stores/authStore';
import type { Annotation, AnnotationType } from '../../../types/entities';
import { useChapterReview, useApproveChapter, useRequireChapterRevision } from '../hooks/useReview';
import { ANNOTATION_TYPE_CONFIG, QC_CHECKLIST_ITEMS, formatVND } from '../constants';
import { Point } from 'fabric';

interface ChapterQCReviewProps {
  chapterId: string;
  onBack: () => void;
}

export const ChapterQCReview = ({ chapterId, onBack }: ChapterQCReviewProps) => {
  const { data: chapter, isLoading } = useChapterReview(chapterId);
  const editorName = useAuthStore((s) => s.user?.fullName) ?? 'Tantou Editor';

  const approveChapter = useApproveChapter();
  const requireRevision = useRequireChapterRevision();

  const {
    activeTool, zoomLevel, annotationType, selectedAnnotationId,
    setActiveTool, setZoomLevel, setAnnotationType, setSelectedAnnotation, resetCanvas,
  } = useCanvasStore();

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [annoComment, setAnnoComment] = useState('');
  const [showApprove, setShowApprove] = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [checklist, setChecklist] = useState<boolean[]>(QC_CHECKLIST_ITEMS.map(() => false));
  const canvasRef = useRef<CanvasViewerHandle>(null);

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
      editorName: (a.Editor as Record<string, string>)?.FullName || 'Editor',
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

  const pages = useMemo(() => chapter?.Pages ?? [], [chapter?.Pages]);
  const currentPage = pages[currentPageIndex];
  const pageId = String(currentPage?.Id ?? '');

  const pageAnnotations = useMemo(
    () => annotations.filter((a) => a.pageId === pageId),
    [annotations, pageId],
  );

  // F3.2 — a page with any unresolved error annotation is Invalid.
  const pageHasError = useCallback(
    (pid: string) => annotations.some((a) => a.pageId === pid && !a.resolved),
    [annotations],
  );

  const validPageCount = useMemo(
    () => pages.filter((p) => !pageHasError(String(p.Id))).length,
    [pages, pageHasError],
  );

  const genkouryo = validPageCount * (chapter?.AppliedGenkouryoPrice ?? 0);
  const totalUnresolved = annotations.filter((a) => !a.resolved).length;

  // ─── Handlers ───
  const handleCreate = useCallback(
    (data: { x: number; y: number; type: AnnotationType; comment: string }) => {
      if (!data.comment.trim()) {
        toast.error('Vui lòng nhập nội dung lỗi trước khi ghim');
        return;
      }
      const ts = new Date().toISOString();
      setAnnotations((prev) => [
        ...prev,
        {
          id: `anno-${Date.now()}`,
          pageId,
          editorId: 'me',
          editorName,
          type: data.type,
          x: data.x,
          y: data.y,
          comment: data.comment.trim(),
          resolved: false,
          createdAt: ts,
          updatedAt: ts,
        },
      ]);
      setAnnoComment('');
      toast.success(`Đã ghim ${ANNOTATION_TYPE_CONFIG[data.type].label}`);
    },
    [pageId, editorName],
  );

  const handleDelete = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setSelectedAnnotation(null);
  }, [setSelectedAnnotation]);

  const handleToggleResolved = useCallback((id: string) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: !a.resolved } : a)),
    );
  }, []);

  const handleApprove = () => {
    approveChapter.mutate(
      { chapterId, validPageCount, genkouryo },
      {
        onSuccess: () => {
          toast.success(`Đã duyệt Chapter · Giải ngân ${formatVND(genkouryo)} nhuận bút`, { duration: 4000 });
          setShowApprove(false);
          onBack();
        },
        onError: () => toast.error('Có lỗi khi duyệt Chapter'),
      },
    );
  };

  const handleRevision = () => {
    if (!revisionReason.trim()) {
      toast.error('Vui lòng nhập lý do yêu cầu sửa');
      return;
    }
    requireRevision.mutate(
      { chapterId, reason: revisionReason },
      {
        onSuccess: () => {
          toast.success('Đã trả Chapter về cho Mangaka chỉnh sửa');
          setShowRevision(false);
          onBack();
        },
        onError: () => toast.error('Có lỗi khi gửi yêu cầu sửa'),
      },
    );
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

  const allChecked = checklist.every(Boolean);

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
        <p className="text-text-secondary">Không tìm thấy chapter để review</p>
        <button onClick={onBack} className="text-brand text-sm hover:underline cursor-pointer">
          ← Quay lại hàng đợi
        </button>
      </div>
    );
  }

  return (
    <>
      <MobileCanvasWarning />
      <div className="hidden md:flex flex-col gap-4 animate-fade-in h-[calc(100vh-120px)]">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between flex-shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-text-primary truncate">
                {chapter.Series?.Title || `Series #${chapter.SeriesId}`} · Ch.{chapter.ChapterNumber}
              </h1>
              <p className="text-xs text-text-muted truncate">
                {chapter.Title} — {chapter.Series?.Mangaka?.FullName || 'Unknown Mangaka'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Trang hợp lệ</p>
              <p className="text-sm font-bold text-text-primary">
                <span className="text-success">{validPageCount}</span> / {pages.length}
              </p>
            </div>
            <button
              onClick={() => setShowRevision(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-amber-500/30 transition-all cursor-pointer"
            >
              <RotateCcw size={14} /> Yêu cầu sửa
            </button>
            <button
              onClick={() => setShowApprove(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium shadow-brand transition-all cursor-pointer"
            >
              <CheckCircle2 size={14} /> Duyệt Chapter
            </button>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 flex flex-col min-h-0 gap-4">
          {/* ═══ Header: Top Toolbar ═══ */}
          <div className="flex items-center justify-between flex-shrink-0 bg-bg-secondary p-2 rounded-xl border border-border-custom">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${pageHasError(pageId)
                    ? 'bg-danger/10 text-danger'
                    : 'bg-success/10 text-success'
                  }`}
              >
                {pageHasError(pageId) ? 'Invalid' : 'Hợp lệ'}
              </span>
              <span className="text-xs text-text-secondary">
                Trang {currentPage?.PageNumber} · {pageAnnotations.length} ghim lỗi
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
              canDelete={!!selectedAnnotationId}
              onDelete={() => {
                if (selectedAnnotationId) {
                  setAnnotations((prev) => prev.filter((a) => a.id !== selectedAnnotationId));
                  setSelectedAnnotation(null);
                }
              }}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="w-8 h-8 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-mono text-text-secondary min-w-[56px] text-center">
                {currentPageIndex + 1} / {pages.length}
              </span>
              <button
                onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === pages.length - 1}
                className="w-8 h-8 rounded-lg bg-bg-primary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* ═══ Main Content: Canvas & Sidebar ═══ */}
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Canvas Area */}
            <div className="flex flex-col flex-1 min-w-0 gap-2">
              <div className="flex-1 relative bg-bg-secondary border border-border-custom rounded-xl overflow-hidden min-h-0">
                {currentPage && (
                  <CanvasViewer
                    ref={canvasRef}
                    key={currentPage.Id}
                    imageUrl={currentPage.CompositeImageUrl || currentPage.RawImageUrl || ''}
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

              {/* Page filmstrip with valid/invalid badges */}
              <div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto pb-1">
                {pages.map((p, idx) => {
                  const invalid = pageHasError(String(p.Id));
                  return (
                    <button
                      key={p.Id}
                      onClick={() => setCurrentPageIndex(idx)}
                      className={`relative flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${idx === currentPageIndex ? 'border-brand' : 'border-border-custom/50 hover:border-border-custom'
                        }`}
                      title={`Trang ${p.PageNumber} — ${invalid ? 'Invalid' : 'Hợp lệ'}`}
                    >
                      <img src={p.CompositeImageUrl || p.RawImageUrl || ''} alt={`p${p.PageNumber}`} className="w-full h-full object-cover" />
                      <span
                        className={`absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-bg-secondary ${invalid ? 'bg-danger' : 'bg-success'
                          }`}
                      />
                      <span className="absolute bottom-0 inset-x-0 text-[9px] text-center text-white bg-black/50">
                        {p.PageNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          {/* Sidebar */}
          <div className="w-[340px] flex-shrink-0 flex flex-col gap-4 min-h-0">
            {/* QC summary */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 flex-shrink-0">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
                <ClipboardCheck size={14} className="text-brand" /> Tổng kết QC
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-bg-surface rounded-lg p-2">
                  <p className="text-lg font-bold text-success">{validPageCount}</p>
                  <p className="text-[9px] text-text-muted">Hợp lệ</p>
                </div>
                <div className="bg-bg-surface rounded-lg p-2">
                  <p className="text-lg font-bold text-danger">{pages.length - validPageCount}</p>
                  <p className="text-[9px] text-text-muted">Invalid</p>
                </div>
                <div className="bg-bg-surface rounded-lg p-2">
                  <p className="text-lg font-bold text-amber-400">{totalUnresolved}</p>
                  <p className="text-[9px] text-text-muted">Lỗi mở</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between p-2.5 bg-success/5 border border-success/20 rounded-lg">
                <span className="text-[11px] text-text-secondary flex items-center gap-1.5">
                  <Banknote size={13} className="text-success" /> Nhuận bút dự kiến
                </span>
                <span className="text-sm font-bold text-success">{formatVND(genkouryo)}</span>
              </div>
              <p className="text-[9px] text-text-muted mt-1.5 text-center">
                {validPageCount} trang × {formatVND(chapter.AppliedGenkouryoPrice || 0)} (G02)
              </p>
            </div>

            {/* Annotations panel */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl flex flex-col flex-1 min-h-0">
              <div className="p-4 border-b border-border-custom flex-shrink-0">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <MapPin size={14} className="text-red-400" /> Ghim lỗi — Trang {currentPage?.PageNumber}
                </h3>

                {activeTool === 'annotate' && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1.5">
                      {(Object.keys(ANNOTATION_TYPE_CONFIG) as AnnotationType[]).map((type) => {
                        const cfg = ANNOTATION_TYPE_CONFIG[type];
                        return (
                          <button
                            key={type}
                            onClick={() => setAnnotationType(type)}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all cursor-pointer ${annotationType === type
                                ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                                : 'bg-bg-primary border-border-custom/50 text-text-muted hover:border-border-custom'
                              }`}
                          >
                            <span>{cfg.icon}</span>
                            <span className="hidden lg:inline">{cfg.short}</span>
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      value={annoComment}
                      onChange={(e) => setAnnoComment(e.target.value)}
                      placeholder="Mô tả lỗi... (bắt buộc)"
                      rows={2}
                      className="w-full px-3 py-2 text-xs bg-bg-primary border border-border-custom rounded-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-brand/50 resize-none"
                    />
                    <p className="text-[9px] text-text-muted">Click lên ảnh để đặt ghim lỗi tại vị trí đó.</p>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {pageAnnotations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-text-muted">
                    <CheckCircle2 size={22} className="text-success" />
                    <p className="text-xs text-center">Trang này chưa có lỗi nào.<br />Chọn công cụ Ghim lỗi để bắt đầu.</p>
                  </div>
                ) : (
                  pageAnnotations.map((a) => {
                    const cfg = ANNOTATION_TYPE_CONFIG[a.type];
                    return (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAnnotation(a.id === selectedAnnotationId ? null : a.id)}
                        className={`group p-3 rounded-lg border transition-all cursor-pointer ${a.id === selectedAnnotationId
                            ? 'border-brand/40 bg-brand/5'
                            : a.resolved
                              ? 'border-border-custom/30 bg-bg-primary/50 opacity-60'
                              : 'border-border-custom/50 bg-bg-primary hover:border-brand/20'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[10px] font-medium flex items-center gap-1 ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleResolved(a.id); }}
                              className="w-5 h-5 rounded flex items-center justify-center text-success hover:bg-success/10 cursor-pointer bg-transparent border-none"
                              title={a.resolved ? 'Mở lại lỗi' : 'Đánh dấu đã xử lý'}
                            >
                              {a.resolved ? <RotateCcw size={10} /> : <CheckCircle2 size={10} />}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                              className="w-5 h-5 rounded flex items-center justify-center text-danger hover:bg-danger/10 cursor-pointer bg-transparent border-none"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-text-secondary mt-1.5 line-clamp-2">{a.comment}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[9px] text-text-muted">{a.editorName}</span>
                          {a.resolved && (
                            <span className="text-[9px] text-success flex items-center gap-0.5">
                              <CheckCircle2 size={8} /> Đã xử lý
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* ─── Approve Modal (F3.6) ─── */}
      {showApprove && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowApprove(false)} />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border-custom sticky top-0 bg-bg-secondary">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-success" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">Duyệt Chapter & Giải ngân</h3>
              </div>
              <button onClick={() => setShowApprove(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface cursor-pointer bg-transparent border-none">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {totalUnresolved > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-400">
                    Còn {totalUnresolved} lỗi chưa xử lý → {pages.length - validPageCount} trang đang bị tính Invalid và sẽ không được trả nhuận bút.
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-2">
                  QC Checklist (bắt buộc)
                </p>
                <div className="space-y-1">
                  {QC_CHECKLIST_ITEMS.map((item, idx) => (
                    <label key={idx} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-bg-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist[idx]}
                        onChange={(e) =>
                          setChecklist((prev) => prev.map((v, i) => (i === idx ? e.target.checked : v)))
                        }
                        className="mt-0.5 w-4 h-4 rounded accent-brand cursor-pointer flex-shrink-0"
                      />
                      <span className="text-xs text-text-secondary">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-bg-surface border border-border-custom rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Số trang hợp lệ (ValidPageCount)</span>
                  <span className="font-semibold text-text-primary">{validPageCount} / {pages.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Đơn giá nhuận bút</span>
                  <span className="font-semibold text-text-primary">{formatVND(chapter.AppliedGenkouryoPrice || 0)}/trang</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border-custom">
                  <span className="text-xs text-text-secondary font-medium">Tổng giải ngân</span>
                  <span className="text-base font-bold text-success">{formatVND(genkouryo)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button onClick={() => setShowApprove(false)} className="px-4 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary cursor-pointer">
                Hủy
              </button>
              <button
                onClick={handleApprove}
                disabled={!allChecked || approveChapter.isPending}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border-none transition-all ${!allChecked || approveChapter.isPending
                    ? 'bg-success/40 text-white/60 cursor-not-allowed'
                    : 'bg-success hover:brightness-110 text-white cursor-pointer'
                  }`}
                title={!allChecked ? 'Cần tick hết QC Checklist' : undefined}
              >
                {approveChapter.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Duyệt & Giải ngân
              </button>
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
                <h3 className="text-base font-semibold text-text-primary">Yêu cầu sửa Chapter</h3>
              </div>
              <button onClick={() => setShowRevision(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface cursor-pointer bg-transparent border-none">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-text-secondary">
                Chapter sẽ được trả về cho <span className="text-text-primary font-medium">{chapter.Series?.Mangaka?.FullName || 'Unknown Mangaka'}</span> kèm {totalUnresolved} lỗi đã ghim để chỉnh sửa.
              </p>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Lý do / Tóm tắt yêu cầu sửa <span className="text-danger">*</span>
                </label>
                <textarea
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="Tóm tắt các điểm cần Mangaka xử lý..."
                  rows={4}
                  className="w-full px-4 py-3 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 resize-none"
                  maxLength={500}
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
