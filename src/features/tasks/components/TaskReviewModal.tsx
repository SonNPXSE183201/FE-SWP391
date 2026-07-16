import { useState, useRef, useMemo, useCallback } from 'react';
import { AnimatedModal } from '../../../components/common/animation';
import toast from 'react-hot-toast';
import {
  X, Eye, UserCheck, Calendar, DollarSign, FileText,
  Loader2, ImageOff, CheckCircle2, RotateCcw, ExternalLink,
  Send, MapPin, AlertTriangle,
} from 'lucide-react';

import type { TasksDto } from '../../../api/generated/types';
import type { AnnotationType } from '../../../types/status.types';
import type { CanvasAnnotation } from '../../canvas/types/canvas.types';
import { CanvasViewer } from '../../../components/canvas/CanvasViewer';
import { CanvasToolbar } from '../../../components/canvas/CanvasToolbar';
import { AnnotationPinPanel } from '../../../components/canvas/AnnotationPinPanel';
import type { CanvasViewerHandle } from '../../../components/canvas/CanvasViewer';
import type { CanvasTool } from '../../../stores/canvasStore';
import { useTaskVersions, useApproveTask, useRequestRevisionTask, useCompositedPageUrl, useReportDisputeTask } from '../hooks/useTasks';
import { TaskLayerPreview } from './TaskLayerPreview';
import { AcceptanceCriteriaViewer } from './AcceptanceCriteriaViewer';
import { ANNOTATION_TYPE_CONFIG } from '../../../constants/annotation';
import { formatDeadline } from '../constants';
import { formatVND } from '../../wallet';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';

interface TaskReviewModalProps {
  task: TasksDto & {
    seriesTitle?: string | null;
    chapterTitle?: string | null;
    chapterNumber?: number;
    baseLayerUrl?: string | null;
  };
  onClose: () => void;
}

interface Pin {
  id: string;
  x: number;
  y: number;
  type: AnnotationType;
  comment: string;
}

const VERSION_STATUS: Record<string, { label: string; cls: string }> = {
  Submitted: { label: 'Chờ duyệt', cls: 'bg-warning/10 text-warning' },
  Approved: { label: 'Đã duyệt', cls: 'bg-success/10 text-success' },
  Rejected: { label: 'Bị từ chối', cls: 'bg-danger/10 text-danger' },
};

export const TaskReviewModal = ({ task, onClose }: TaskReviewModalProps) => {
  const taskId = String(task.id ?? '');
  const { data: versions = [], isLoading } = useTaskVersions(taskId);
  const approveMutation = useApproveTask();
  const revisionMutation = useRequestRevisionTask();
  const disputeMutation = useReportDisputeTask();

  const [activeIdx, setActiveIdx] = useState(0);
  const [revising, setRevising] = useState(false);
  const [showRevisionConfirm, setShowRevisionConfirm] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [versionsLenSeen, setVersionsLenSeen] = useState(versions.length);

  if (versions.length !== versionsLenSeen) {
    setActiveIdx(0);
    setVersionsLenSeen(versions.length);
  }

  const [pins, setPins] = useState<Pin[]>([]);
  const [pinType, setPinType] = useState<AnnotationType>('Technical');
  const [pinComment, setPinComment] = useState('');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [extensionHours, setExtensionHours] = useState<24 | 48>(24);
  const [activeTool, setActiveTool] = useState<CanvasTool>('annotate');
  const [zoomLevel, setZoomLevel] = useState(100);
  const canvasRef = useRef<CanvasViewerHandle>(null);

  const active = versions[activeIdx];
  const activeUrl = active?.submittedFileUrl ? resolveMediaUrl(active.submittedFileUrl) : '';
  const pageIdStr = task.pageId ? String(task.pageId) : undefined;
  const { data: compositeUrl, isFetching: isCompositeLoading } = useCompositedPageUrl(pageIdStr);
  const compositeBase = compositeUrl || (task.baseLayerUrl ? resolveMediaUrl(task.baseLayerUrl) : '') || (task.pageImageUrl ? resolveMediaUrl(task.pageImageUrl) : '');
  const dl = formatDeadline(task.deadline || '');
  const canReview = task.status === 'Submitted';
  const isPinningActive = activeTool === 'annotate';
  const contextLabel = task.regionName ? task.regionName : `Vùng ${task.regionId}`;

  const viewerAnnotations = useMemo<CanvasAnnotation[]>(
    () => pins.map((p) => ({
      id: p.id,
      pageId: '',
      editorId: 'me',
      editorName: 'Mangaka',
      type: p.type,
      x: p.x,
      y: p.y,
      comment: p.comment,
      resolved: false,
      createdAt: '',
      updatedAt: '',
    })),
    [pins],
  );

  const autoRevisionSummary = useMemo(() => {
    if (!pins.length) return '';
    const lines = pins.map((p, i) => {
      const cfg = ANNOTATION_TYPE_CONFIG[p.type];
      return `- Lỗi ${i + 1} (${cfg.short}): ${p.comment}`;
    });
    return `Vui lòng chỉnh sửa theo các điểm đã ghim:\n${lines.join('\n')}`.slice(0, 500);
  }, [pins]);

  const startPinning = useCallback(() => setActiveTool('annotate'), []);

  const handleAddPin = useCallback(
    (data: { x: number; y: number; type: AnnotationType; comment: string }) => {
      if (!pinComment.trim()) {
        toast.error('Nhập mô tả lỗi trước khi ghim lên ảnh');
        return;
      }
      const id = `pin-${Date.now()}`;
      setPins((prev) => [...prev, { id, x: data.x, y: data.y, type: pinType, comment: pinComment.trim() }]);
      setPinComment('');
      setSelectedPinId(id);
      toast.success(`Đã ghim ${ANNOTATION_TYPE_CONFIG[pinType].label}`);
    },
    [pinComment, pinType],
  );

  const handleDeletePin = useCallback((id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
    setSelectedPinId(null);
  }, []);

  const handleZoomIn = useCallback(() => canvasRef.current?.zoomBy(1.1), []);
  const handleZoomOut = useCallback(() => canvasRef.current?.zoomBy(0.9), []);
  const handleZoomReset = useCallback(() => canvasRef.current?.resetView(), []);
  const handleZoomFit = useCallback(() => canvasRef.current?.resetView(), []);

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(taskId);
      toast.success('Đã duyệt & nghiệm thu bài vẽ. Tiền đã chuyển cho Trợ lý.');
      onClose();
    } catch {
      toast.error('Lỗi khi duyệt bài');
    }
  };

  const openRevisionConfirm = () => {
    if (!feedback.trim() && pins.length === 0) {
      toast.error('Ghim ít nhất một lỗi hoặc nhập nhận xét trước khi gửi');
      return;
    }
    setFeedback((current) => current.trim() || autoRevisionSummary);
    setShowRevisionConfirm(true);
  };

  const handleSubmitRevision = async () => {
    const finalFeedback = feedback.trim() || autoRevisionSummary.trim();
    if (!finalFeedback) {
      toast.error('Vui lòng nhập nhận xét tổng quát cho yêu cầu sửa đổi');
      return;
    }
    const coordinatesJson = JSON.stringify(
      pins.map((p) => ({ x: p.x, y: p.y, type: p.type, comment: p.comment })),
    );
    try {
      await revisionMutation.mutateAsync({
        taskId,
        comment: finalFeedback,
        extensionHours,
        coordinatesJson,
      });
      toast.success(`Đã gửi yêu cầu sửa đổi (${pins.length} điểm lỗi) · +${extensionHours}h deadline`);
      onClose();
    } catch {
      toast.error('Lỗi khi gửi yêu cầu sửa đổi');
    }
  };

  const revisionConfirmModal = showRevisionConfirm && (
    <AnimatedModal
      open
      onClose={() => setShowRevisionConfirm(false)}
      zIndex={60}
      panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-md"
    >
        <div className="flex items-center justify-between p-5 border-b border-border-custom">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <RotateCcw size={18} className="text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Yêu cầu Trợ lý sửa bài</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowRevisionConfirm(false)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface cursor-pointer bg-transparent border-none"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-text-secondary">
            Task sẽ được trả về cho{' '}
            <span className="text-text-primary font-medium">{task.assistantName || 'Trợ lý'}</span>
            {pins.length > 0 ? ` kèm ${pins.length} điểm lỗi đã ghim` : ''} để chỉnh sửa.
          </p>

          {pins.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-amber-500">
                  Lỗi đã ghim ({pins.length})
                </p>
                <button
                  type="button"
                  onClick={() => setFeedback(autoRevisionSummary)}
                  className="text-[10px] font-medium text-amber-600/80 hover:text-amber-500 hover:underline bg-transparent border-none cursor-pointer transition-colors"
                >
                  Dùng làm tóm tắt tự động
                </button>
              </div>
              <ul className="space-y-2 text-xs text-text-secondary">
                {pins.slice(0, 6).map((p, i) => {
                  const cfg = ANNOTATION_TYPE_CONFIG[p.type];
                  return (
                    <li key={p.id} className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                      <span><span className="font-medium text-text-primary">{cfg.short} #{i + 1}:</span> {p.comment}</span>
                    </li>
                  );
                })}
                {pins.length > 6 && (
                  <li className="text-text-muted italic text-[11px] ml-3.5">+ {pins.length - 6} lỗi khác...</li>
                )}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              Lý do / Nhận xét tổng quát <span className="text-danger">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={pins.length > 0
                ? 'Nhập nhận xét tổng quát cho Trợ lý...'
                : 'Tóm tắt các điểm cần Trợ lý xử lý...'}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 bg-bg-primary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
            />
            <p className="text-[10px] text-text-muted mt-1.5 text-right">{feedback.length}/500</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              Gia hạn deadline cho Trợ lý
            </label>
            <div className="flex gap-2">
              {([24, 48] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setExtensionHours(h)}
                  className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all cursor-pointer ${extensionHours === h
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500 shadow-sm'
                      : 'border-border-custom bg-bg-surface text-text-secondary hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-500'
                    }`}
                >
                  <span className="text-xs font-bold">+{h} giờ</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-custom bg-bg-surface/50 rounded-b-2xl">
          <button
            type="button"
            onClick={() => setShowRevisionConfirm(false)}
            className="px-4 py-2 bg-bg-secondary border border-border-custom rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmitRevision}
            disabled={revisionMutation.isPending || !feedback.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white border-none cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {revisionMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Xác nhận gửi yêu cầu
          </button>
        </div>
    </AnimatedModal>
  );

  const disputeModal = showDisputeModal && (
    <AnimatedModal
      open
      onClose={() => setShowDisputeModal(false)}
      zIndex={60}
      panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-lg-custom w-full max-w-md"
    >
        <div className="flex items-center justify-between p-5 border-b border-border-custom">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-danger/15 flex items-center justify-center">
              <AlertTriangle size={18} className="text-danger" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Báo cáo sự cố / Tranh chấp</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowDisputeModal(false)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface cursor-pointer bg-transparent border-none"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-text-secondary">
            Nếu có bất đồng không thể giải quyết bằng cách "Yêu cầu sửa", bạn có thể gửi báo cáo tranh chấp. Editor sẽ tham gia phân xử.
          </p>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Lý do tranh chấp</label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full bg-bg-surface border border-border-custom rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-danger/50 focus:ring-1 focus:ring-danger/50 min-h-[100px] resize-none"
              placeholder="VD: Trợ lý lặn mất tăm, nộp bài copy trên mạng..."
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border-custom bg-bg-surface/50 rounded-b-2xl">
          <button
            type="button"
            onClick={() => setShowDisputeModal(false)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer border-none bg-transparent"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!disputeReason.trim()) {
                toast.error('Vui lòng nhập lý do tranh chấp');
                return;
              }
              try {
                await disputeMutation.mutateAsync({ taskId, reason: disputeReason.trim() });
                toast.success('Đã gửi báo cáo tranh chấp. Editor sẽ xem xét và phản hồi sớm nhất.');
                setShowDisputeModal(false);
                onClose();
              } catch {
                toast.error('Có lỗi xảy ra khi gửi báo cáo');
              }
            }}
            disabled={!disputeReason.trim() || disputeMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-danger hover:bg-red-600 text-white border-none cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {disputeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Xác nhận gửi
          </button>
        </div>
    </AnimatedModal>
  );

  return (
    <>
      <AnimatedModal
        open
        onClose={onClose}
        panelClassName={`relative bg-bg-secondary border border-border-custom rounded-2xl flex flex-col shadow-lg-custom overflow-hidden ${revising ? 'w-full max-w-6xl h-[900px] max-h-full' : 'w-full max-w-4xl h-[900px] max-h-full'}`}
      >
          {/* Header */}
          <div className="shrink-0 border-b border-border-custom px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${revising ? 'bg-amber-500/10' : 'bg-brand/10'
                }`}>
                {revising ? (
                  <RotateCcw size={18} className="text-amber-400" />
                ) : (
                  <Eye size={18} className="text-brand" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-text-primary truncate">
                  {task.description || `Task ${taskId}`}
                </h2>
                <p className="text-[11px] text-text-muted truncate">
                  {revising
                    ? `${task.seriesTitle || ''}${task.chapterNumber ? ` · Ch.${task.chapterNumber}` : ''} — Ghim lỗi rồi gửi yêu cầu sửa`
                    : 'Xem bài nộp của Trợ lý trước khi nghiệm thu'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          <div className={`flex-1 min-h-0 flex flex-col p-4 gap-3 ${revising ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden custom-scrollbar'}`}>
            {/* Meta row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
              {task.seriesTitle && (
                <div className="col-span-2 sm:col-span-4 flex items-center gap-1.5 text-[11px] text-text-secondary truncate">
                  <FileText size={12} className="text-brand shrink-0" />
                  <span className="truncate">
                    {task.seriesTitle}
                    {task.chapterNumber ? ` · Ch.${task.chapterNumber}` : ''}
                    {task.chapterTitle ? `: ${task.chapterTitle}` : ''}
                    {task.pageNumber ? ` · Trang ${task.pageNumber}` : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                <UserCheck size={12} className="text-text-muted" />
                {task.assistantName || 'Chưa có Trợ lý'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-primary">
                <DollarSign size={12} className="text-text-muted" />
                {formatVND(task.paymentAmount || 0)}
              </div>
              <div className={`flex items-center gap-1.5 text-[11px] font-medium ${dl.urgent ? 'text-danger' : 'text-text-muted'}`}>
                <Calendar size={12} />
                {dl.text}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                <MapPin size={12} className="text-text-muted" />
                {contextLabel}
              </div>
            </div>

            {task.acceptanceCriteria && (
              <div className="shrink-0">
                <AcceptanceCriteriaViewer criteria={task.acceptanceCriteria} />
              </div>
            )}

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center bg-bg-surface rounded-xl border border-border-custom">
                <Loader2 size={28} className="animate-spin text-brand" />
              </div>
            ) : versions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-bg-surface rounded-xl border border-border-custom text-center px-6">
                <ImageOff size={36} className="text-text-muted" />
                <p className="text-sm text-text-secondary">Trợ lý chưa nộp bản vẽ nào cho task này.</p>
              </div>
            ) : revising ? (
              /* ─── Revising: Editor-like workspace ─── */
              <div className="flex-1 min-h-0 flex gap-3">
                <div className="flex-1 flex flex-col min-h-0 bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border-custom bg-bg-primary/40 shrink-0">
                    <span className="text-[10px] text-text-muted truncate">
                      Ghim trên lớp bài nộp · {contextLabel}
                    </span>
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
                      canDelete={!!selectedPinId}
                      onDelete={() => {
                        if (selectedPinId) handleDeletePin(selectedPinId);
                      }}
                      variant="docked"
                    />
                  </div>
                  <div className="flex-1 relative min-h-0 bg-bg-primary/40">
                    {activeUrl ? (
                      <CanvasViewer
                        ref={canvasRef}
                        imageUrl={activeUrl}
                        backdrop="checkerboard"
                        annotations={viewerAnnotations}
                        mode={activeTool === 'annotate' ? 'annotate' : 'view'}
                        onAnnotationCreated={handleAddPin}
                        selectedAnnotationId={selectedPinId}
                        onAnnotationSelect={setSelectedPinId}
                        onZoomChange={setZoomLevel}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2 text-text-muted px-4 text-center">
                        <ImageOff size={32} />
                        <span className="text-xs">Không tải được ảnh để ghim lỗi</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-[300px] xl:w-[320px] flex-shrink-0 flex flex-col gap-3 min-h-0 overflow-y-auto overflow-x-hidden rounded-xl">


                  <AnnotationPinPanel
                    contextLabel={contextLabel}
                    annotations={pins.map((p) => ({
                      id: p.id,
                      type: p.type,
                      comment: p.comment,
                    }))}
                    annotationType={pinType}
                    onAnnotationTypeChange={setPinType}
                    comment={pinComment}
                    onCommentChange={setPinComment}
                    isPinningActive={isPinningActive}
                    onStartPinning={startPinning}
                    selectedId={selectedPinId}
                    onSelect={setSelectedPinId}
                    onDelete={handleDeletePin}
                  />
                </div>
              </div>
            ) : (
              /* ─── View mode ─── */
              <div className="flex flex-col shrink-0 gap-3">
                <p className="shrink-0 text-[11px] text-text-muted">Duyệt trên Canvas tổng thể (composite + lớp nộp bài)</p>
                <div className="flex grow shrink-0 min-h-[250px] lg:min-h-[400px] gap-3">
                  {versions.length > 1 && (
                    <div className="flex flex-col gap-2 overflow-y-auto pr-1 shrink-0 w-16 custom-scrollbar">
                      {versions.map((v, idx) => {
                        const thumb = v.submittedFileUrl ? resolveMediaUrl(v.submittedFileUrl) : '';
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setActiveIdx(idx)}
                            className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 bg-white transition-all cursor-pointer ${idx === activeIdx ? 'border-brand' : 'border-border-custom hover:border-text-muted'
                              }`}
                            title={`Phiên bản ${v.versionNumber}`}
                          >
                            {thumb ? (
                              <img src={thumb} alt={`v${v.versionNumber}`} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-bg-surface">
                                <ImageOff size={14} className="text-text-muted" />
                              </div>
                            )}
                            <span className="absolute bottom-0 inset-x-0 text-[9px] font-medium bg-black/60 text-white text-center">
                              v{v.versionNumber}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex-1 relative bg-bg-surface rounded-xl border border-border-custom overflow-hidden flex flex-col">
                    {(isCompositeLoading && !compositeUrl) ? (
                      <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={32} className="animate-spin text-brand" />
                      </div>
                    ) : compositeBase || activeUrl ? (
                      <TaskLayerPreview
                        baseImageUrl={compositeBase || task.pageImageUrl}
                        overlayImageUrl={activeUrl}
                        coordinatesJson={task.regionCoordinatesJson}
                        regionName={task.regionName}
                        overlayMode="region"
                        heightClassName="flex-1"
                        className="rounded-none border-0 w-full"
                      />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-text-muted">
                      <ImageOff size={32} />
                      <span className="text-xs">Không tải được ảnh bài nộp</span>
                    </div>
                  )}
                  {active && (
                    <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
                      <span className="text-[10px] font-semibold bg-black/60 text-white px-2 py-1 rounded">
                        Phiên bản {active.versionNumber}
                      </span>
                      {active.status && VERSION_STATUS[active.status] && (
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded ${VERSION_STATUS[active.status].cls}`}>
                          {VERSION_STATUS[active.status].label}
                        </span>
                      )}
                    </div>
                  )}
                  {activeUrl && (
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 text-[10px] font-medium bg-black/60 text-white px-2 py-1 rounded hover:bg-black/80 transition-colors no-underline"
                    >
                      <ExternalLink size={11} /> Mở lớp PNG gốc
                    </a>
                  )}
                  </div>
                </div>
              </div>
            )}


          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-border-custom px-5 py-4 flex items-center justify-end gap-3 bg-bg-secondary">
            {revising ? (
              <>
                <button
                  type="button"
                  onClick={() => setRevising(false)}
                  className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  Quay lại xem bài
                </button>
                <button
                  type="button"
                  onClick={openRevisionConfirm}
                  disabled={pins.length === 0 && !feedback.trim()}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${pins.length === 0 && !feedback.trim()
                      ? 'bg-amber-500/40 text-white/60 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                >
                  <Send size={15} />
                  Gửi yêu cầu sửa
                  {pins.length > 0 ? ` (${pins.length} lỗi)` : ''}
                </button>
              </>
            ) : (
              <>
                {canReview && (
                  <button
                    type="button"
                    onClick={() => setShowDisputeModal(true)}
                    className="mr-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 cursor-pointer transition-colors"
                  >
                    <AlertTriangle size={15} />
                    Báo cáo sự cố / Tranh chấp
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                {canReview && (
                  <>
                    <button
                      type="button"
                      onClick={() => { setActiveIdx(0); setRevising(true); setActiveTool('annotate'); }}
                      disabled={versions.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-bg-surface border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw size={15} />
                      Yêu cầu sửa
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={approveMutation.isPending || versions.length === 0}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${approveMutation.isPending || versions.length === 0
                          ? 'bg-success/40 text-white/70 cursor-not-allowed'
                          : 'bg-success hover:bg-success/90 text-white'
                        }`}
                    >
                      {approveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                      Duyệt & nghiệm thu
                    </button>
                  </>
                )}
              </>
            )}
          </div>
      </AnimatedModal>
      {revisionConfirmModal}
      {disputeModal}
    </>
  );
};
