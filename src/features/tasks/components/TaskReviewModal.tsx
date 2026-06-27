import { useState, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  X, Eye, UserCheck, Calendar, DollarSign, FileText,
  Loader2, ImageOff, CheckCircle2, RotateCcw, ExternalLink,
  Clock, Trash2, MapPin, ArrowLeft,
} from 'lucide-react';

import type { TasksDto } from '../../../api/generated/types';
import type { Annotation, AnnotationType } from '../../../types/entities';
import { CanvasViewer } from '../../../components/canvas/CanvasViewer';
import type { CanvasViewerHandle } from '../../../components/canvas/CanvasViewer';
import { useTaskVersions, useApproveTask, useRequestRevisionTask } from '../hooks/useTasks';
import { ANNOTATION_TYPE_CONFIG } from '../../review/constants';
import { formatDeadline } from '../constants';
import { formatVND } from '../../wallet';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';

interface TaskReviewModalProps {
  task: TasksDto;
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
  Pending_Review: { label: 'Chờ duyệt', cls: 'bg-warning/10 text-warning' },
  Approved: { label: 'Đã duyệt', cls: 'bg-success/10 text-success' },
  Rejected: { label: 'Bị từ chối', cls: 'bg-danger/10 text-danger' },
};

const ANNOTATION_TYPES: AnnotationType[] = ['Technical', 'Art', 'Content'];

export const TaskReviewModal = ({ task, onClose }: TaskReviewModalProps) => {
  const taskId = String(task.id ?? '');
  const { data: versions = [], isLoading } = useTaskVersions(taskId);
  const approveMutation = useApproveTask();
  const revisionMutation = useRequestRevisionTask();

  const [activeIdx, setActiveIdx] = useState(0);
  const [revising, setRevising] = useState(false);
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
  const canvasRef = useRef<CanvasViewerHandle>(null);

  const active = versions[activeIdx];
  const activeUrl = active?.submittedFileUrl ? resolveMediaUrl(active.submittedFileUrl) : '';
  const dl = formatDeadline(task.deadline || '');
  const canReview = task.status === 'Pending_Review';

  // Map local pins → Annotation[] cho CanvasViewer render
  const viewerAnnotations = useMemo<Annotation[]>(
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

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(taskId);
      toast.success('Đã duyệt & nghiệm thu bài vẽ. Tiền đã chuyển cho Trợ lý.');
      onClose();
    } catch {
      toast.error('Lỗi khi duyệt bài');
    }
  };

  const handleSubmitRevision = async () => {
    if (!feedback.trim()) {
      toast.error('Vui lòng nhập nhận xét tổng quát cho yêu cầu sửa đổi');
      return;
    }
    const coordinatesJson = JSON.stringify(
      pins.map((p) => ({ x: p.x, y: p.y, type: p.type, comment: p.comment })),
    );
    try {
      await revisionMutation.mutateAsync({
        taskId,
        comment: feedback.trim(),
        extensionHours,
        coordinatesJson,
      });
      toast.success(`Đã gửi yêu cầu sửa đổi (${pins.length} điểm lỗi) · +${extensionHours}h deadline`);
      onClose();
    } catch {
      toast.error('Lỗi khi gửi yêu cầu sửa đổi');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-4xl max-h-[94vh] overflow-y-auto shadow-lg-custom animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-secondary border-b border-border-custom px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
              {revising ? <RotateCcw size={18} className="text-danger" /> : <Eye size={18} className="text-brand" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text-primary truncate">
                {task.description || `Task ${taskId}`}
              </h2>
              <p className="text-[11px] text-text-muted">
                {revising ? 'Ghim điểm lỗi lên ảnh rồi gửi yêu cầu sửa đổi' : 'Xem bài nộp của Trợ lý trước khi nghiệm thu'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Task meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <FileText size={12} className="text-text-muted" />
              Vùng {task.regionId} · Trang {task.pageNumber ?? '?'}
            </div>
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
          </div>

          {/* ─── Annotate toolbar (revising mode) ─── */}
          {revising && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-bg-surface border border-border-custom rounded-xl p-2.5">
              <div className="flex items-center gap-1.5">
                {ANNOTATION_TYPES.map((t) => {
                  const cfg = ANNOTATION_TYPE_CONFIG[t];
                  const isActive = pinType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setPinType(t)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                        isActive ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-bg-secondary text-text-muted border-border-custom hover:text-text-secondary'
                      }`}
                    >
                      <span>{cfg.icon}</span>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={pinComment}
                onChange={(e) => setPinComment(e.target.value)}
                placeholder="Mô tả lỗi cho điểm ghim tiếp theo, rồi click lên ảnh…"
                className="flex-1 px-3 py-1.5 bg-bg-secondary border border-border-custom rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>
          )}

          {/* ─── Content: ảnh bài nộp / chế độ ghim lỗi ─── */}
          {isLoading ? (
            <div className="h-[420px] flex items-center justify-center bg-bg-surface rounded-xl border border-border-custom">
              <Loader2 size={28} className="animate-spin text-brand" />
            </div>
          ) : versions.length === 0 ? (
            <div className="h-[420px] flex flex-col items-center justify-center gap-3 bg-bg-surface rounded-xl border border-border-custom text-center px-6">
              <ImageOff size={36} className="text-text-muted" />
              <p className="text-sm text-text-secondary">Trợ lý chưa nộp bản vẽ nào cho task này.</p>
            </div>
          ) : revising ? (
            <div className="grid lg:grid-cols-[1fr_300px] gap-4">
              {/* Canvas annotate */}
              <div className="h-[300px] lg:h-[460px] bg-bg-surface rounded-xl border border-border-custom overflow-hidden">
                {activeUrl ? (
                  <CanvasViewer
                    ref={canvasRef}
                    imageUrl={activeUrl}
                    annotations={viewerAnnotations}
                    mode="annotate"
                    onAnnotationCreated={handleAddPin}
                    selectedAnnotationId={selectedPinId}
                    onAnnotationSelect={setSelectedPinId}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-text-muted px-4 text-center">
                    <ImageOff size={32} />
                    <span className="text-xs">Không tải được ảnh để ghim lỗi — bạn vẫn có thể gửi nhận xét bên cạnh.</span>
                  </div>
                )}
              </div>

              {/* Controls: danh sách điểm lỗi + nhận xét + gia hạn (luôn hiển thị) */}
              <div className="flex flex-col gap-3 lg:max-h-[460px] lg:overflow-y-auto lg:pr-1">
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-danger" />
                    Điểm lỗi đã ghim ({pins.length})
                  </p>
                  {pins.length === 0 ? (
                    <p className="text-[11px] text-text-muted italic">Chọn loại lỗi, nhập mô tả rồi click lên ảnh để ghim.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {pins.map((p, i) => {
                        const cfg = ANNOTATION_TYPE_CONFIG[p.type];
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPinId(p.id)}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                              selectedPinId === p.id ? `${cfg.bg} ${cfg.border}` : 'bg-bg-surface border-border-custom'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-text-muted w-4">{i + 1}</span>
                            <span>{cfg.icon}</span>
                            <span className="flex-1 min-w-0 text-[11px] text-text-secondary truncate">{p.comment}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeletePin(p.id); }}
                              className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger/10 transition-colors border-none bg-transparent cursor-pointer flex-shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Nhận xét tổng quát <span className="text-danger">*</span>
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Vd: Đổ bóng bị lố ở góc trên, nét nhân vật chính cần dứt khoát hơn…"
                    rows={3}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Gia hạn deadline (bắt buộc)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([24, 48] as const).map((h) => (
                      <button
                        key={h}
                        onClick={() => setExtensionHours(h)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                          extensionHours === h ? 'border-brand bg-brand/10 text-brand' : 'border-border-custom bg-bg-surface text-text-secondary hover:border-text-muted'
                        }`}
                      >
                        <Clock size={15} />
                        +{h} giờ
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative bg-bg-surface rounded-xl border border-border-custom overflow-hidden flex items-center justify-center h-[420px]">
                {activeUrl ? (
                  <img
                    src={activeUrl}
                    alt={`Phiên bản ${active?.versionNumber}`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <ImageOff size={32} />
                    <span className="text-xs">Không tải được ảnh bài nộp</span>
                  </div>
                )}
                {active && (
                  <div className="absolute top-2 left-2 flex items-center gap-2">
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
                    className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-medium bg-black/60 text-white px-2 py-1 rounded hover:bg-black/80 transition-colors no-underline"
                  >
                    <ExternalLink size={11} /> Mở ảnh gốc
                  </a>
                )}
              </div>

              {versions.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {versions.map((v, idx) => {
                    const thumb = v.submittedFileUrl ? resolveMediaUrl(v.submittedFileUrl) : '';
                    return (
                      <button
                        key={v.id}
                        onClick={() => setActiveIdx(idx)}
                        className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          idx === activeIdx ? 'border-brand' : 'border-border-custom hover:border-text-muted'
                        }`}
                        title={`Phiên bản ${v.versionNumber}`}
                      >
                        {thumb ? (
                          <img src={thumb} alt={`v${v.versionNumber}`} className="w-full h-full object-cover" />
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
            </div>
          )}

          {/* ─── Nhận xét gần nhất (chế độ xem) ─── */}
          {!revising && task.feedbackComment && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-warning mb-0.5">Nhận xét gần nhất của tác giả</p>
              <p className="text-[11px] text-text-secondary">{task.feedbackComment}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-bg-secondary border-t border-border-custom px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          {revising ? (
            <>
              <button
                onClick={() => setRevising(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <ArrowLeft size={15} />
                Quay lại
              </button>
              <button
                onClick={handleSubmitRevision}
                disabled={revisionMutation.isPending || !feedback.trim()}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
                  revisionMutation.isPending || !feedback.trim()
                    ? 'bg-danger/40 text-white/70 cursor-not-allowed'
                    : 'bg-danger hover:bg-red-600 text-white'
                }`}
              >
                {revisionMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                Gửi yêu cầu sửa đổi
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                Đóng
              </button>
              {canReview && (
                <>
                  <button
                    onClick={() => { setActiveIdx(0); setRevising(true); }}
                    disabled={versions.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-danger/10 text-danger hover:bg-danger/20 border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw size={15} />
                    Yêu cầu sửa đổi
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={approveMutation.isPending || versions.length === 0}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
                      approveMutation.isPending || versions.length === 0
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
      </div>
    </div>,
    document.body,
  );
};
