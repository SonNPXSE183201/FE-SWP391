import { useState, useMemo } from 'react';
import { AnimatedModal } from '../../../components/common/animation';
import toast from 'react-hot-toast';
import {
  X, RotateCcw, User, Calendar, FileText,
  Loader2, ImageOff, ExternalLink, MapPin, Upload, Clock,
  Image as ImageIcon, ClipboardList, Eye, CheckCircle2, AlertCircle,
  Coins, FileCheck2, Hourglass, BookOpen, Sparkles,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { useColorizeImage } from '../../ai/hooks/useColorizeImage';

import type { TasksDto } from '../../../api/generated/types';
import type { CanvasAnnotation } from '../../canvas/types/canvas.types';
import type { AnnotationType, TaskStatus } from '../../../types/status.types';
import { CanvasViewer } from '../../../components/canvas/CanvasViewer';
import { TaskRegionPreview } from './TaskRegionPreview';
import { TaskLayerPreview } from './TaskLayerPreview';
import { useTaskVersions, useTaskVersionAnnotations, useRequestExtension, useReportDisputeTask } from '../hooks/useTasks';
import { taskApi } from '../api/task.api';
import { parseTaskRevisionPins } from '../../canvas/utils/canvas.utils';
import { ANNOTATION_TYPE_CONFIG } from '../../review/constants';
import { TASK_STATUS_CONFIG, formatDeadline } from '../constants';
import { formatVND } from '../../wallet';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { validatePngTransparent } from '../../../utils/validatePngTransparent';

interface AssistantTaskDetailModalProps {
  task: TasksDto & {
    seriesTitle?: string | null;
    chapterTitle?: string | null;
    chapterNumber?: number;
    baseLayerUrl?: string | null;
  };
  onClose: () => void;
}

const VERSION_STATUS: Record<string, { label: string; cls: string }> = {
  Submitted: { label: 'Chờ duyệt', cls: 'bg-warning/10 text-warning' },
  Approved: { label: 'Đã duyệt', cls: 'bg-success/10 text-success' },
  Rejected: { label: 'Bị từ chối', cls: 'bg-danger/10 text-danger' },
};

export const AssistantTaskDetailModal = ({ task, onClose }: AssistantTaskDetailModalProps) => {
  const taskId = String(task.id ?? '');
  const queryClient = useQueryClient();
  const { data: versions = [], isLoading } = useTaskVersions(taskId);
  const extensionMutation = useRequestExtension();

  const statusKey = (task.status || 'Pending') as TaskStatus;
  const statusCfg = TASK_STATUS_CONFIG[statusKey] || TASK_STATUS_CONFIG.Pending;
  const isRevision = task.status === 'Revision';
  const canSubmit = ['In_Progress', 'Revision'].includes(task.status || '');
  const isReadOnly = !canSubmit;

  const versionResetKey = `${taskId}:${versions.length}:${versions.findIndex((v) => v.status === 'Rejected')}`;
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewConfirmed, setPreviewConfirmed] = useState(false);
  const [showExtension, setShowExtension] = useState(false);
  const [extensionReason, setExtensionReason] = useState('');
  const [versionResetSeen, setVersionResetSeen] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const reportDisputeTask = useReportDisputeTask();

  const { mutate: colorize, isPending: isColorizing } = useColorizeImage();

  const handleAIColorize = () => {
    let imageUrl = task.baseLayerUrl || task.pageImageUrl;
    if (!imageUrl) {
      toast.error('Không tìm thấy ảnh gốc để tô màu');
      return;
    }
    if (imageUrl.startsWith('/')) {
      imageUrl = `${window.location.origin}${imageUrl}`;
    }
    colorize(imageUrl, {
      onSuccess: (url) => {
        toast.success('Tô màu thành công! Đang mở ảnh màu (Base)...');
        window.open(url, '_blank');
      },
      onError: (err) => {
        toast.error(err.message || 'Lỗi khi gọi AI tô màu');
      }
    });
  };

  if (versionResetKey !== versionResetSeen) {
    const rejectedIdx = versions.findIndex((v) => v.status === 'Rejected');
    const latestIdx = versions.length > 0 ? versions.length - 1 : 0;
    setActiveIdx(isRevision && rejectedIdx >= 0 ? rejectedIdx : latestIdx);
    setSelectedPinId(null);
    setVersionResetSeen(versionResetKey);
  }

  const active = versions[activeIdx];
  const activeVersionId = active?.id ? String(active.id) : undefined;
  const { data: annotationRecords = [], isLoading: annotationsLoading } =
    useTaskVersionAnnotations(isRevision ? activeVersionId : undefined);

  const activeUrl = active?.submittedFileUrl ? resolveMediaUrl(active.submittedFileUrl) : '';
  const refUrl = task.pageImageUrl ? resolveMediaUrl(task.pageImageUrl) : '';
  const dl = formatDeadline(task.deadline || '');

  const pins = useMemo(() => {
    const all: Array<{ id: string; x: number; y: number; type: AnnotationType; comment: string }> = [];
    annotationRecords.forEach((record, ri) => {
      parseTaskRevisionPins(record.coordinatesJson).forEach((p, pi) => {
        all.push({ ...p, id: `pin-${ri}-${pi}` });
      });
    });
    return all;
  }, [annotationRecords]);

  const viewerAnnotations = useMemo<CanvasAnnotation[]>(
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

  const handleFileSelect = (file: File | null) => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setSelectedFile(file);
    setFilePreviewUrl(file ? URL.createObjectURL(file) : null);
    setPreviewConfirmed(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file PNG kết quả trước khi nộp');
      return;
    }
    if (!previewConfirmed) {
      toast.error('Hãy xem trước trên Canvas và xác nhận khớp bối cảnh trước khi nộp');
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
      toast.success(isRevision ? 'Nộp bản sửa thành công!' : 'Nộp bài thành công!');
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

  const HeaderIcon = isRevision ? RotateCcw : canSubmit ? ClipboardList : Eye;
  const headerIconCls = isRevision ? 'bg-danger/10 text-danger' : canSubmit ? 'bg-info/10 text-info' : `${statusCfg.bg} ${statusCfg.color}`;

  const submitPanel = (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
          <FileCheck2 size={15} className="text-success" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary leading-tight">
            {isRevision ? 'Nộp bản sửa' : 'Nộp kết quả'}
          </p>
          <p className="text-[11px] text-text-muted leading-tight">
            Ảnh định dạng PNG nền trong suốt, khớp kích thước vùng vẽ.
          </p>
        </div>
      </div>

      {(() => {
        const desc = (task.description || '').toLowerCase();
        const isColoringTask = ['tô màu', 'to mau', 'color', 'lên màu', 'len mau', 'flat color', 'phủ màu'].some(kw => desc.includes(kw));
        return isColoringTask ? (
          <div className="flex justify-between items-center bg-brand/5 border border-brand/20 p-3 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-brand">✨ AI Trợ lý màu</p>
              <p className="text-[10px] text-text-muted mt-0.5">Tạo base color nhanh trong 5s để tô tiếp</p>
            </div>
            <button
              type="button"
              onClick={handleAIColorize}
              disabled={isColorizing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait shadow-sm"
            >
              <Sparkles size={14} className={isColorizing ? 'animate-pulse' : ''} />
              {isColorizing ? 'Đang tô màu...' : 'Tô màu ảnh gốc'}
            </button>
          </div>
        ) : null;
      })()}

      <label
        className={`group relative flex flex-col items-center justify-center gap-2.5 px-4 py-7 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          selectedFile
            ? 'border-success/40 bg-success/5 hover:border-success/60'
            : 'border-border-custom bg-bg-surface hover:border-brand/50 hover:bg-brand/5'
        }`}
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${selectedFile ? 'bg-success/10' : 'bg-bg-secondary group-hover:bg-brand/10'}`}>
          <Upload size={20} className={selectedFile ? 'text-success' : 'text-text-muted group-hover:text-brand'} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-text-primary break-all">
            {selectedFile ? selectedFile.name : 'Kéo thả hoặc bấm để tải lên ảnh PNG'}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">
            {selectedFile
              ? `${(selectedFile.size / 1024).toFixed(0)} KB · Bấm để đổi ảnh khác`
              : 'Chỉ chấp nhận ảnh .png có nền trong suốt'}
          </p>
        </div>
        <input
          type="file"
          accept="image/png,.png"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        />
      </label>

      {filePreviewUrl && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
            <Eye size={13} className="text-brand" />
            Xem trước trên Canvas (F2.8)
          </p>
          <TaskLayerPreview
            baseImageUrl={task.baseLayerUrl || task.pageImageUrl}
            overlayImageUrl={filePreviewUrl}
            coordinatesJson={task.regionCoordinatesJson}
            regionName={task.regionName}
            heightClassName="h-48"
            label="Preview — kiểm tra khớp khung & thoại"
          />
          {!previewConfirmed ? (
            <button
              type="button"
              onClick={() => setPreviewConfirmed(true)}
              className="w-full py-2.5 rounded-xl bg-brand/10 text-brand text-xs font-semibold border border-brand/30 cursor-pointer hover:bg-brand/15 transition-colors"
            >
              Xác nhận hình vẽ đã khớp bối cảnh
            </button>
          ) : (
            <p className="text-[11px] text-success flex items-center gap-1.5 justify-center">
              <CheckCircle2 size={13} /> Đã xác nhận — có thể nộp bài
            </p>
          )}
        </div>
      )}

      <div className="mt-auto pt-1">
        {showExtension ? (
          <div className="space-y-2 p-3 bg-bg-surface rounded-xl border border-border-custom">
            <p className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
              <Hourglass size={13} className="text-brand" />
              Xin gia hạn thời gian
            </p>
            <textarea
              value={extensionReason}
              onChange={(e) => setExtensionReason(e.target.value)}
              placeholder="Lý do xin gia hạn…"
              rows={2}
              className="w-full px-3 py-2 bg-bg-secondary border border-border-custom rounded-lg text-xs text-text-primary resize-none focus:outline-none focus:border-brand/50"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRequestExtension(1)}
                disabled={extensionMutation.isPending || !!task.extensionRequestDays}
                className="py-2 bg-brand/10 text-brand rounded-lg text-xs font-semibold border-none cursor-pointer disabled:opacity-50 hover:bg-brand/15 transition-colors"
              >
                Thêm 24h
              </button>
              <button
                type="button"
                onClick={() => handleRequestExtension(2)}
                disabled={extensionMutation.isPending || !!task.extensionRequestDays}
                className="py-2 bg-brand/10 text-brand rounded-lg text-xs font-semibold border-none cursor-pointer disabled:opacity-50 hover:bg-brand/15 transition-colors"
              >
                Thêm 48h
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setShowExtension(false); setExtensionReason(''); }}
              className="w-full py-1 text-xs text-text-muted border-none bg-transparent cursor-pointer hover:text-text-secondary"
            >
              Hủy
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowExtension(true)}
            disabled={!!task.extensionRequestDays}
            className="w-full py-2.5 text-xs font-medium text-text-secondary bg-bg-surface border border-border-custom rounded-xl cursor-pointer disabled:opacity-50 hover:border-brand/30 hover:text-text-primary transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Clock size={13} />
            {task.extensionRequestDays ? 'Đã xin gia hạn' : 'Xin gia hạn thời gian'}
          </button>
        )}
      </div>
    </div>
  );

  const referencePanel = (
    <div className="flex flex-col h-full min-h-0">
      <p className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-bg-surface flex items-center justify-center shrink-0">
          <ImageIcon size={14} className="text-text-muted" />
        </span>
        Ảnh tham khảo
      </p>
      <div className="flex-1 min-h-[240px] lg:min-h-[360px] rounded-xl border border-border-custom overflow-hidden bg-bg-surface relative">
        {refUrl ? (
          <>
            {!canSubmit && activeUrl ? (
              <TaskLayerPreview
                baseImageUrl={task.baseLayerUrl || task.pageImageUrl}
                overlayImageUrl={activeUrl}
                coordinatesJson={task.regionCoordinatesJson}
                regionName={task.regionName}
                heightClassName="h-full min-h-[240px] lg:min-h-[360px]"
                className="rounded-none border-0"
                label="Đã lồng ghép (Preview)"
              />
            ) : (
              <TaskRegionPreview
                imageUrl={task.pageImageUrl}
                coordinatesJson={task.regionCoordinatesJson}
                regionName={task.regionName}
                heightClassName="h-full min-h-[240px] lg:min-h-[360px]"
                className="rounded-none border-0"
              />
            )}
            <a
              href={refUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 text-[10px] font-medium bg-black/60 text-white px-2 py-1 rounded hover:bg-black/80 transition-colors no-underline"
            >
              <ExternalLink size={11} /> Mở ảnh gốc
            </a>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-text-muted p-6 text-center">
            <ImageOff size={32} />
            <span className="text-xs">Không có ảnh tham khảo</span>
          </div>
        )}
      </div>
      <p className="text-[11px] text-text-muted mt-2">
        {task.regionName ? `Vùng: ${task.regionName}` : `Vùng ${task.regionId}`} · Trang {task.pageNumber ?? '?'}
      </p>
    </div>
  );

  return (
    <>
    <AnimatedModal
      open
      onClose={onClose}
      panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-5xl max-h-full overflow-hidden shadow-lg-custom flex flex-col"
    >
        {/* Header */}
        <div className="shrink-0 bg-bg-secondary border-b border-border-custom px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${headerIconCls}`}>
              <HeaderIcon size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-text-primary truncate">
                  {task.description || `Task ${taskId}`}
                </h2>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${statusCfg.bg} ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                {canSubmit
                  ? 'Xem mô tả và nộp ảnh kết quả'
                  : isReadOnly && task.status === 'Submitted'
                    ? 'Bài đã nộp — đang chờ Mangaka duyệt'
                    : 'Xem chi tiết công việc và bài nộp'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Context tree (F2.6) */}
        {(task.seriesTitle || task.chapterTitle) && (
          <div className="shrink-0 px-6 py-2.5 border-b border-border-custom bg-brand/5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-secondary">
            <BookOpen size={12} className="text-brand shrink-0" />
            {task.seriesTitle && <span className="font-semibold text-text-primary">{task.seriesTitle}</span>}
            {task.chapterNumber != null && task.chapterNumber > 0 && (
              <>
                <span className="text-text-muted">›</span>
                <span>Ch.{task.chapterNumber}{task.chapterTitle ? `: ${task.chapterTitle}` : ''}</span>
              </>
            )}
            {(task.pageNumber ?? 0) > 0 && (
              <>
                <span className="text-text-muted">›</span>
                <span>Trang {task.pageNumber}</span>
              </>
            )}
            {task.regionName && (
              <>
                <span className="text-text-muted">›</span>
                <span className="text-brand font-medium">{task.regionName}</span>
              </>
            )}
          </div>
        )}

        {/* Meta bar */}
        <div className="shrink-0 px-6 py-3 border-b border-border-custom bg-bg-surface/40 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand/10 px-2.5 py-1 text-xs font-bold tabular-nums text-brand">
            <Coins size={13} />
            {formatVND(task.paymentAmount || 0)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-bg-surface px-2.5 py-1 text-xs text-text-secondary">
            <User size={12} className="opacity-60" /> {task.mangakaName || 'Mangaka'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-bg-surface px-2.5 py-1 text-xs text-text-secondary">
            <FileText size={12} className="opacity-60" /> Trang {task.pageNumber ?? '?'}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
              dl.urgent ? 'bg-danger/10 text-danger' : 'bg-bg-surface text-text-muted'
            }`}
          >
            <Calendar size={12} className={dl.urgent ? '' : 'opacity-60'} /> {dl.text}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {task.feedbackComment && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 mb-4">
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
            <div className="h-[360px] flex items-center justify-center bg-bg-surface rounded-xl border border-border-custom">
              <Loader2 size={28} className="animate-spin text-brand" />
            </div>
          ) : canSubmit ? (
            /* Submit mode: reference + form */
            <div className="grid lg:grid-cols-2 gap-6">
              {referencePanel}
              {submitPanel}
              {isRevision && versions.length > 0 && (
                <div className="lg:col-span-2 space-y-4 pt-2 border-t border-border-custom">
                  <p className="text-sm font-semibold text-text-primary">Bản nộp trước & điểm ghim lỗi</p>
                  <div className="grid lg:grid-cols-[1fr_280px] gap-4">
                    <div className="h-[280px] rounded-xl border border-border-custom overflow-hidden bg-bg-surface relative">
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
                        <div className="h-full flex items-center justify-center text-text-muted text-xs">Không có ảnh bản nộp</div>
                      )}
                    </div>
                    <RevisionPinList
                      pins={pins}
                      annotationsLoading={annotationsLoading}
                      activeStatus={active?.status}
                      selectedPinId={selectedPinId}
                      onSelectPin={setSelectedPinId}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Read-only: submitted work + reference */
            <div className="grid lg:grid-cols-[1fr_280px] gap-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-bg-surface flex items-center justify-center shrink-0">
                    {task.status === 'Approved' ? (
                      <CheckCircle2 size={14} className="text-success" />
                    ) : task.status === 'Disputed' ? (
                      <AlertCircle size={14} className="text-warning" />
                    ) : (
                      <Eye size={14} className="text-warning" />
                    )}
                  </span>
                  Bài đã nộp
                </p>
                <div className="h-[300px] lg:h-[400px] rounded-xl border border-border-custom overflow-hidden bg-bg-surface relative">
                  {activeUrl ? (
                    <>
                      <CanvasViewer
                        imageUrl={activeUrl}
                        annotations={[]}
                        mode="view"
                        className="w-full h-full"
                      />
                      <a
                        href={activeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-medium bg-black/60 text-white px-2 py-1 rounded hover:bg-black/80 no-underline"
                      >
                        <ExternalLink size={11} /> Mở ảnh gốc
                      </a>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-text-muted">
                      <ImageOff size={32} />
                      <span className="text-xs">Chưa có file bài nộp</span>
                    </div>
                  )}
                  {active && (
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded ${VERSION_STATUS[active.status || '']?.cls || 'bg-black/60 text-white'}`}>
                        {VERSION_STATUS[active.status || '']?.label || `v${active.versionNumber}`}
                      </span>
                    </div>
                  )}
                </div>
                {versions.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {versions.map((v, idx) => {
                      const thumb = v.submittedFileUrl ? resolveMediaUrl(v.submittedFileUrl) : '';
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setActiveIdx(idx)}
                          className={`relative shrink-0 w-14 h-16 rounded-lg overflow-hidden border-2 cursor-pointer ${
                            idx === activeIdx ? 'border-brand' : 'border-border-custom hover:border-text-muted'
                          }`}
                        >
                          {thumb ? (
                            <img src={thumb} alt={`v${v.versionNumber}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-bg-surface">
                              <ImageOff size={12} className="text-text-muted" />
                            </div>
                          )}
                          <span className="absolute bottom-0 inset-x-0 text-[9px] bg-black/60 text-white text-center">v{v.versionNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {referencePanel}
                {task.status === 'Approved' && (
                  <p className="text-xs text-success bg-success/10 border border-success/20 rounded-xl p-3">
                    Hoàn thành — tiền thù lao đã chuyển vào ví của bạn.
                  </p>
                )}
                {task.status === 'Disputed' && (
                  <p className="text-xs text-warning bg-warning/10 border border-warning/20 rounded-xl p-3">
                    Task đang tranh chấp — Editor sẽ phân xử và thông báo kết quả.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-bg-secondary border-t border-border-custom px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            {canSubmit ? 'Hủy' : 'Đóng'}
          </button>
          {(task.status === 'Submitted' || task.status === 'Revision') && (
            <button
              type="button"
              onClick={() => setShowDisputeModal(true)}
              className="mr-auto px-4 py-2.5 bg-warning/10 border border-warning/30 rounded-xl text-sm font-medium text-warning hover:bg-warning hover:text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <AlertCircle size={15} />
              Báo cáo tranh chấp
            </button>
          )}
          {canSubmit && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedFile || !previewConfirmed}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all ${
                isSubmitting || !selectedFile || !previewConfirmed
                  ? 'bg-success/40 text-white/70 cursor-not-allowed'
                  : 'bg-success hover:bg-green-600 text-white'
              }`}
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {isRevision ? 'Xác nhận nộp bản sửa' : 'Xác nhận nộp bài'}
            </button>
          )}
        </div>
    </AnimatedModal>
    {showDisputeModal && (
      <AnimatedModal
        open
        onClose={() => setShowDisputeModal(false)}
        zIndex={100}
        panelClassName="bg-bg-primary w-full max-w-md rounded-2xl shadow-2xl border border-border-custom p-6"
      >
            <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
              <AlertCircle className="text-warning" size={20} />
              Báo cáo sự cố / Tranh chấp
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Nếu bạn không thể đạt được thỏa thuận với Mangaka (ví dụ: Mangaka yêu cầu sửa quá vô lý nhiều lần để giam tiền), bạn có thể báo cáo tranh chấp. <strong>Editor sẽ vào cuộc phân xử.</strong>
            </p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Nhập lý do chi tiết..."
              className="w-full bg-bg-surface border border-border-custom rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none min-h-[100px]"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-bg-surface border border-border-custom rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!disputeReason.trim() || reportDisputeTask.isPending}
                onClick={() => {
                  reportDisputeTask.mutate(
                    { taskId: taskId.toString(), reason: disputeReason.trim() },
                    {
                      onSuccess: () => {
                        setShowDisputeModal(false);
                        onClose();
                      },
                    }
                  );
                }}
                className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 ${
                  !disputeReason.trim() || reportDisputeTask.isPending
                    ? 'bg-warning/50 text-white/70 cursor-not-allowed'
                    : 'bg-warning text-white hover:bg-orange-600'
                }`}
              >
                {reportDisputeTask.isPending && <Loader2 size={14} className="animate-spin" />}
                Xác nhận báo cáo
              </button>
            </div>
      </AnimatedModal>
    )}
    </>
  );
};

function RevisionPinList({
  pins,
  annotationsLoading,
  activeStatus,
  selectedPinId,
  onSelectPin,
}: {
  pins: Array<{ id: string; type: AnnotationType; comment: string }>;
  annotationsLoading: boolean;
  activeStatus?: string | null;
  selectedPinId: string | null;
  onSelectPin: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-text-secondary mb-3 flex items-center gap-1.5">
        <MapPin size={13} className="text-danger" />
        Điểm lỗi ({pins.length})
      </p>
      {annotationsLoading ? (
        <div className="flex items-center justify-center gap-2 text-xs text-text-muted py-8">
          <Loader2 size={16} className="animate-spin text-brand" />
          Đang tải…
        </div>
      ) : pins.length === 0 ? (
        <div className="py-8 text-center bg-bg-surface border border-border-custom border-dashed rounded-xl">
          <p className="text-xs text-text-muted italic px-4">
            {activeStatus === 'Rejected'
              ? 'Chưa có điểm ghim — xem nhận xét tổng quát phía trên.'
              : 'Chọn phiên bản bị từ chối để xem điểm ghim.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1.5 custom-scrollbar">
          {pins.map((p, i) => {
            const cfg = ANNOTATION_TYPE_CONFIG[p.type];
            const isSelected = selectedPinId === p.id;
            const bgSolid = cfg.bg.replace('/10', '');
            const bgMuted = cfg.bg.replace('/10', '/20');

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPin(p.id)}
                className={`focus:outline-none w-full text-left flex items-start gap-3 p-3 rounded-xl border cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? `${cfg.bg} ${cfg.border} shadow-md`
                    : 'bg-bg-surface border-border-custom hover:border-text-muted/30 hover:bg-bg-surface/80'
                }`}
              >
                {isSelected && (
                  <div className={`absolute inset-y-0 left-0 w-[3px] ${bgSolid}`} />
                )}
                
                <div className={`flex items-center justify-center w-5 h-5 mt-0.5 rounded-full shrink-0 text-[10px] font-bold transition-colors ${
                  isSelected 
                    ? `${bgMuted} ${cfg.color}` 
                    : 'bg-bg-secondary text-text-muted group-hover:bg-bg-primary group-hover:text-text-primary'
                }`}>
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`text-[11px] font-bold tracking-wide ${isSelected ? cfg.color : 'text-text-primary group-hover:text-brand transition-colors'}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed break-words ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {p.comment}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
