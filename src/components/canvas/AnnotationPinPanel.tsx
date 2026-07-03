import {
  MapPin, CheckCircle2, RotateCcw, Trash2,
} from 'lucide-react';
import type { AnnotationType } from '../../types/entities';
import { ANNOTATION_TYPE_CONFIG } from '../../features/review/constants';

export interface PinListItem {
  id: string;
  type: AnnotationType;
  comment: string;
  resolved?: boolean;
  meta?: string;
}

interface AnnotationPinPanelProps {
  /** e.g. "Trang 3" or "Vùng 5" */
  contextLabel: string;
  annotations: PinListItem[];
  annotationType: AnnotationType;
  onAnnotationTypeChange: (type: AnnotationType) => void;
  comment: string;
  onCommentChange: (value: string) => void;
  isPinningActive: boolean;
  onStartPinning: () => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onToggleResolved?: (id: string) => void;
  maxCommentLength?: number;
  showResolvedToggle?: boolean;
  className?: string;
}

const ANNOTATION_TYPES: AnnotationType[] = ['Technical', 'Art', 'Content'];

export const AnnotationPinPanel = ({
  contextLabel,
  annotations,
  annotationType,
  onAnnotationTypeChange,
  comment,
  onCommentChange,
  isPinningActive,
  onStartPinning,
  selectedId,
  onSelect,
  onDelete,
  onToggleResolved,
  maxCommentLength = 200,
  showResolvedToggle = false,
  className = '',
}: AnnotationPinPanelProps) => (
  <div className={`bg-bg-secondary border border-border-custom rounded-xl flex flex-col flex-1 min-h-0 ${className}`}>
    <div className="p-3 border-b border-border-custom flex-shrink-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
          <MapPin size={13} className="text-red-400" />
          Ghim lỗi · {contextLabel}
        </h3>
        {!isPinningActive ? (
          <button
            type="button"
            onClick={onStartPinning}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand/10 border border-brand/25 text-[10px] font-semibold text-brand hover:bg-brand/20 transition-colors cursor-pointer"
          >
            <MapPin size={10} />
            Bắt đầu
          </button>
        ) : (
          <span className="text-[10px] font-medium text-brand">Đang ghim</span>
        )}
      </div>


      <div className={`mt-3 space-y-2 transition-opacity ${isPinningActive ? 'opacity-100' : 'opacity-60'}`}>
        <div className="flex gap-1">
          {ANNOTATION_TYPES.map((type) => {
            const cfg = ANNOTATION_TYPE_CONFIG[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onAnnotationTypeChange(type);
                  onStartPinning();
                }}
                className={`flex-1 flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg text-[9px] font-medium border transition-all cursor-pointer ${
                  annotationType === type
                    ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                    : 'bg-bg-primary border-border-custom text-text-secondary hover:border-border-custom'
                }`}
              >
                <span className="text-sm leading-none">{cfg.icon}</span>
                <span>{cfg.short}</span>
              </button>
            );
          })}
        </div>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          onFocus={onStartPinning}
          placeholder="Nhập mô tả lỗi (bắt buộc) rồi click lên ảnh để ghim..."
          rows={2}
          maxLength={maxCommentLength}
          className="w-full px-2.5 py-2 text-xs bg-bg-primary border border-border-custom rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 resize-none"
        />
        <div className="flex items-center justify-between text-[9px] text-text-muted">
          <span>Click ảnh để ghim vị trí</span>
          <span className="tabular-nums">{comment.length}/{maxCommentLength}</span>
        </div>
      </div>
    </div>

    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-3 py-2 bg-bg-primary/50 border-b border-border-custom flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
          Danh sách đã ghim ({annotations.length})
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[150px] bg-bg-surface/30">
        {annotations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-text-muted">
          <CheckCircle2 size={20} className="text-success/70" />
          <p className="text-[11px] text-center text-text-secondary leading-relaxed">
            Chưa có lỗi nào.
            <br />
            Nhấn <span className="text-brand font-medium">Bắt đầu</span> để ghim lỗi.
          </p>
        </div>
      ) : (
        annotations.map((a) => {
          const cfg = ANNOTATION_TYPE_CONFIG[a.type];
          return (
            <div
              key={a.id}
              onClick={() => onSelect(a.id === selectedId ? null : a.id)}
              className={`group p-2.5 rounded-lg border transition-all cursor-pointer ${
                a.id === selectedId
                  ? 'border-brand/40 bg-brand/5'
                  : a.resolved
                    ? 'border-border-custom/30 bg-bg-primary/40 opacity-60'
                    : 'border-border-custom/50 bg-bg-primary hover:border-brand/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-medium flex items-center gap-1 ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {showResolvedToggle && onToggleResolved && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onToggleResolved(a.id); }}
                      className="w-6 h-6 rounded flex items-center justify-center text-success hover:bg-success/10 cursor-pointer bg-transparent border-none"
                      title={a.resolved ? 'Mở lại lỗi' : 'Đánh dấu đã xử lý'}
                    >
                      {a.resolved ? <RotateCcw size={11} /> : <CheckCircle2 size={11} />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(a.id); }}
                    className="w-6 h-6 rounded flex items-center justify-center text-danger hover:bg-danger/10 cursor-pointer bg-transparent border-none"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              {a.comment ? (
                <p className="text-[11px] text-text-primary mt-1.5 line-clamp-2 leading-snug">{a.comment}</p>
              ) : (
                <p className="text-[10px] text-text-muted mt-1.5 italic">Không có mô tả</p>
              )}
              {a.meta && (
                <span className="text-[9px] text-text-muted mt-1 block">{a.meta}</span>
              )}
              {a.resolved && (
                <span className="text-[9px] text-success flex items-center gap-0.5 mt-1">
                  <CheckCircle2 size={8} /> Đã xử lý
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
    </div>
  </div>
);
