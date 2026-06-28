import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  X, RotateCcw, User, Calendar, DollarSign, FileText,
  Loader2, ImageOff, ExternalLink, MapPin, Upload, Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type { TasksDto } from '../../../api/generated/types';
import type { Annotation } from '../../../types/entities';
import { CanvasViewer } from '../../../components/canvas/CanvasViewer';
import { useTaskVersions, useTaskVersionAnnotations, useRequestExtension } from '../hooks/useTasks';
import { taskApi } from '../api/task.api';
import { parseTaskRevisionPins } from '../../canvas/utils/canvas.utils';
import { ANNOTATION_TYPE_CONFIG } from '../../review/constants';
import { formatDeadline } from '../constants';
import { formatVND } from '../../wallet';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { validatePngTransparent } from '../../../utils/validatePngTransparent';

interface AssistantTaskDetailModalProps {
  task: TasksDto;
  onClose: () => void;
}

const VERSION_STATUS: Record<string, { label: string; cls: string }> = {
  Submitted: { label: 'Chờ duyệt', cls: 'bg-warning/10 text-warning' },
  Pending_Review: { label: 'Chờ duyệt', cls: 'bg-warning/10 text-warning' },
  Approved: { label: 'Đã duyệt', cls: 'bg-success/10 text-success' },
  Rejected: { label: 'Bị từ chối', cls: 'bg-danger/10 text-danger' },
};

export const AssistantTaskDetailModal = ({ task, onClose }: AssistantTaskDetailModalProps) => {
  const taskId = String(task.id ?? '');
  const queryClient = useQueryClient();
  const { data: versions = [], isLoading } = useTaskVersions(taskId);
  const extensionMutation = useRequestExtension();

  const versionResetKey = `${taskId}:${versions.length}:${versions.findIndex((v) => v.status === 'Rejected')}`;
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExtension, setShowExtension] = useState(false);
  const [extensionReason, setExtensionReason] = useState('');
  const [versionResetSeen, setVersionResetSeen] = useState('');

  if (versionResetKey !== versionResetSeen) {
    const rejectedIdx = versions.findIndex((v) => v.status === 'Rejected');
    setActiveIdx(rejectedIdx >= 0 ? rejectedIdx : 0);
    setSelectedPinId(null);
    setVersionResetSeen(versionResetKey);
  }

  const active = versions[activeIdx];
  const activeVersionId = active?.id ? String(active.id) : undefined;
  const { data: annotationRecords = [], isLoading: annotationsLoading } =
    useTaskVersionAnnotations(activeVersionId);

  const activeUrl = active?.submittedFileUrl ? resolveMediaUrl(active.submittedFileUrl) : '';
  const refUrl = task.pageImageUrl ? resolveMediaUrl(task.pageImageUrl) : '';
  const dl = formatDeadline(task.deadline || '');
  const isRevision = task.status === 'Revision';
  const canSubmit = ['In_Progress', 'Revision'].includes(task.status || '');

  const pins = useMemo(() => {
    const all: Array<{ id: string; x: number; y: number; type: Annotation['type']; comment: string }> = [];
    annotationRecords.forEach((record, ri) => {
      parseTaskRevisionPins(record.coordinatesJson).forEach((p, pi) => {
        all.push({ ...p, id: `pin-${ri}-${pi}` });
      });
    });
    return all;
  }, [annotationRecords]);

  const viewerAnnotations = useMemo<Annotation[]>(
    () => pins.map((p) => ({
      id: p.id,
      pageId: '',
      editorId: 'mangaka',
      editorName: task.mangakaName || 'Mangaka',
      type: p.type,
      x: p.x,
      y: p.y,
      comment: p.comment,
      resolved: false,
      createdAt: '',
      updatedAt: '',
    })),
    [pins, task.mangakaName],
  );

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file PNG kết quả trước khi nộp');
      return;
    }
    const validation = await validatePngTransparent(selectedFile);
    if (!validation.valid) {
      toast.error(validation.message || 'File PNG không hợp lệ');
      return;
    }
    setIsSubmitting(true);
    try {
      await taskApi.submitResult(taskId, { taskId, image: selectedFile, comment: '' });
      toast.success('Nộp bản sửa thành công!');
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assistant-my'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mangaka'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId, 'versions'] });
      onClose();
    } catch {
      toast.error('Lỗi khi nộp bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestExtension = async (days: 1 | 2) => {
    if (!extensionReason.trim()) {
      toast.error('Vui lòng nhập lý do xin gia hạn');
      return;
    }
    try {
      await extensionMutation.mutateAsync({ taskId, days, reason: extensionReason.trim() });
      toast.success(`Đã xin gia hạn thêm ${days * 24}h`);
      setShowExtension(false);
      setExtensionReason('');
    } catch {
      toast.error('Lỗi khi xin gia hạn');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-5xl max-h-[94vh] overflow-y-auto shadow-lg-custom animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-secondary border-b border-border-custom px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0">
              <RotateCcw size={18} className="text-danger" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text-primary truncate">
                {task.description || `Task ${taskId}`}
              </h2>
              <p className="text-[11px] text-text-muted">
                {isRevision
                  ? 'Xem điểm ghim lỗi và nhận xét của Mangaka trước khi nộp lại'
                  : 'Chi tiết công việc và bài nộp của bạn'}
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
          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <FileText size={12} className="text-text-muted" />
              Vùng {task.regionId} · Trang {task.pageNumber ?? '?'}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <User size={12} className="text-text-muted" />
              {task.mangakaName || 'Mangaka'}
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

          {/* Nhận xét tổng quát của Mangaka */}
          {task.feedbackComment && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-danger mb-1 flex items-center gap-1.5">
                <RotateCcw size={14} />
                Mangaka yêu cầu sửa đổi
              </p>
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {task.feedbackComment}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="h-[420px] flex items-center justify-center bg-bg-surface rounded-xl border border-border-custom">
              <Loader2 size={28} className="animate-spin text-brand" />
            </div>
          ) : versions.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center gap-3 bg-bg-surface rounded-xl border border-border-custom text-center px-6">
              <ImageOff size={36} className="text-text-muted" />
              <p className="text-sm text-text-secondary">Chưa có bản nộp nào.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_300px] gap-4">
              {/* Canvas xem điểm ghim */}
              <div className="space-y-3">
                <div className="h-[300px] lg:h-[420px] bg-bg-surface rounded-xl border border-border-custom overflow-hidden relative">
                  {activeUrl ? (
                    <CanvasViewer
                      imageUrl={activeUrl}
                      annotations={active?.status === 'Rejected' ? viewerAnnotations : []}
                      mode="view"
                      selectedAnnotationId={selectedPinId}
                      onAnnotationSelect={setSelectedPinId}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-text-muted">
                      <ImageOff size={32} />
                      <span className="text-xs">Không tải được ảnh bài nộp</span>
                    </div>
                  )}
                  {active && (
                    <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
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
                          onClick={() => { setActiveIdx(idx); setSelectedPinId(null); }}
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

              {/* Sidebar: điểm ghim + ảnh tham khảo + nộp lại */}
              <div className="flex flex-col gap-3 lg:max-h-[500px] lg:overflow-y-auto lg:pr-1">
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-danger" />
                    Điểm lỗi Mangaka ghim ({pins.length})
                  </p>
                  {annotationsLoading ? (
                    <div className="flex items-center gap-2 text-[11px] text-text-muted py-2">
                      <Loader2 size={14} className="animate-spin" />
                      Đang tải điểm ghim…
                    </div>
                  ) : pins.length === 0 ? (
                    <p className="text-[11px] text-text-muted italic">
                      {active?.status === 'Rejected'
                        ? 'Mangaka chưa ghim điểm lỗi cụ thể — xem nhận xét tổng quát phía trên.'
                        : 'Chọn phiên bản bị từ chối để xem điểm ghim.'}
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {pins.map((p, i) => {
                        const cfg = ANNOTATION_TYPE_CONFIG[p.type];
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPinId(p.id)}
                            className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-colors ${
                              selectedPinId === p.id ? `${cfg.bg} ${cfg.border}` : 'bg-bg-surface border-border-custom'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-text-muted w-4 pt-0.5">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-medium flex items-center gap-1">
                                {cfg.icon} {cfg.label}
                              </span>
                              <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">{p.comment}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {refUrl && (
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1.5">
                      <ImageIcon size={13} />
                      Ảnh tham khảo (trang gốc)
                    </p>
                    <a href={refUrl} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-border-custom hover:border-brand/30 transition-colors">
                      <img src={refUrl} alt="Tham khảo" className="w-full h-24 object-cover" />
                    </a>
                  </div>
                )}

                {canSubmit && (
                  <div className="pt-2 border-t border-border-custom space-y-2">
                    <p className="text-xs font-medium text-text-secondary">Nộp bản sửa (PNG trong suốt)</p>
                    <label className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-border-custom rounded-xl text-xs font-medium cursor-pointer hover:border-brand/30 transition-colors">
                      <ImageIcon size={14} className="text-text-muted flex-shrink-0" />
                      <span className="truncate">{selectedFile ? selectedFile.name : 'Chọn file PNG'}</span>
                      <input
                        type="file"
                        accept="image/png,.png"
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </label>

                    {showExtension ? (
                      <div className="space-y-2 p-3 bg-bg-surface rounded-xl border border-border-custom">
                        <textarea
                          value={extensionReason}
                          onChange={(e) => setExtensionReason(e.target.value)}
                          placeholder="Lý do xin gia hạn…"
                          rows={2}
                          className="w-full px-3 py-2 bg-bg-secondary border border-border-custom rounded-lg text-[11px] text-text-primary resize-none focus:outline-none focus:border-brand/50"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => handleRequestExtension(1)}
                            disabled={extensionMutation.isPending || !!task.extensionRequestDays}
                            className="py-1.5 bg-brand/10 text-brand rounded-lg text-[11px] font-bold border-none cursor-pointer disabled:opacity-50"
                          >
                            +24h
                          </button>
                          <button
                            onClick={() => handleRequestExtension(2)}
                            disabled={extensionMutation.isPending || !!task.extensionRequestDays}
                            className="py-1.5 bg-brand/10 text-brand rounded-lg text-[11px] font-bold border-none cursor-pointer disabled:opacity-50"
                          >
                            +48h
                          </button>
                        </div>
                        <button
                          onClick={() => { setShowExtension(false); setExtensionReason(''); }}
                          className="w-full py-1 text-[11px] text-text-muted border-none bg-transparent cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowExtension(true)}
                        disabled={!!task.extensionRequestDays}
                        className="w-full py-2 text-[11px] font-medium text-text-secondary bg-bg-surface border border-border-custom rounded-lg cursor-pointer disabled:opacity-50"
                      >
                        <Clock size={12} className="inline mr-1" />
                        {task.extensionRequestDays ? 'Đã xin gia hạn' : 'Xin gia hạn deadline'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bg-secondary border-t border-border-custom px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            Đóng
          </button>
          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedFile}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
                isSubmitting || !selectedFile
                  ? 'bg-success/40 text-white/70 cursor-not-allowed'
                  : 'bg-success hover:bg-green-600 text-white'
              }`}
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              Nộp bài sửa
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
