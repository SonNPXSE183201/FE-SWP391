import { SendHorizonal, CheckCircle2, Circle, AlertTriangle, Loader2, MessageSquareQuote } from 'lucide-react';
import {
  SUBMIT_FOR_REVIEW_LABEL,
  NEMU_MANUSCRIPT_LABEL,
  MANGAKA_RESUBMIT_NOTE_LABEL,
  MANGAKA_RESUBMIT_NOTE_HINT,
  MANGAKA_RESUBMIT_NOTE_PLACEHOLDER,
} from '../constants/seriesCopy';

interface ChecklistItem {
  label: string;
  completed: boolean;
  needsRevision?: boolean;
}

interface SubmitChecklistProps {
  items: ChecklistItem[];
  isSubmitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  isRevisionResubmit?: boolean;
  resubmitNote?: string;
  onResubmitNoteChange?: (value: string) => void;
}

export const SubmitChecklist = ({
  items,
  isSubmitting,
  canSubmit,
  onSubmit,
  isRevisionResubmit = false,
  resubmitNote = '',
  onResubmitNoteChange,
}: SubmitChecklistProps) => {
  const displayItems = isRevisionResubmit ? items.filter((i) => i.needsRevision) : items;
  const readyCount = displayItems.filter((i) => i.completed).length;
  const revisionCount = displayItems.filter((i) => i.needsRevision).length;

  return (
    <div
      id="submit-section"
      className="bg-bg-secondary border border-brand/15 rounded-xl p-5 animate-fade-in scroll-mt-6"
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <SendHorizonal size={16} className="text-brand" />
          <h2 className="text-sm font-semibold text-text-primary">
            {isRevisionResubmit ? 'Gửi lại xét duyệt' : SUBMIT_FOR_REVIEW_LABEL}
          </h2>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            readyCount === displayItems.length ? 'bg-emerald-500/10 text-emerald-400' : 'bg-warning/10 text-warning'
          }`}
        >
          {readyCount}/{displayItems.length} sẵn sàng
        </span>
      </div>

      <p className="text-xs text-text-muted mb-4">
        {isRevisionResubmit
          ? 'Sau khi xử lý phản hồi Biên tập viên, gửi lại để tiếp tục quy trình duyệt.'
          : 'Gửi hồ sơ cho Biên tập viên phụ trách đánh giá.'}
        {revisionCount > 0 && (
          <span className="block mt-1 text-amber-400">
            Còn {revisionCount} mục Biên tập viên yêu cầu kiểm tra lại.
          </span>
        )}
      </p>

      {/* Progress */}
      <div className="h-1 rounded-full bg-bg-surface overflow-hidden mb-4">
        <div
          className="h-full bg-brand transition-all duration-300"
          style={{ width: `${displayItems.length ? (readyCount / displayItems.length) * 100 : 0}%` }}
        />
      </div>

      {/* Checklist — full width stacked */}
      <div className="space-y-2 mb-5">
        {displayItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-xs ${
              item.needsRevision
                ? 'bg-amber-500/5 border-amber-500/20'
                : item.completed
                  ? 'bg-emerald-500/5 border-emerald-500/15'
                  : 'bg-bg-surface border-border-custom'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                item.needsRevision
                  ? 'bg-amber-500/15 text-amber-400'
                  : item.completed
                    ? 'bg-success/15 text-success'
                    : 'bg-bg-secondary text-text-muted border border-border-custom'
              }`}
            >
              {item.needsRevision ? (
                <AlertTriangle size={12} />
              ) : item.completed ? (
                <CheckCircle2 size={14} />
              ) : (
                <Circle size={10} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={
                  item.needsRevision
                    ? 'text-amber-200 font-medium'
                    : item.completed
                      ? 'text-text-primary'
                      : 'text-text-muted'
                }
              >
                {item.label}
              </span>
              {item.needsRevision && (
                <span className="block text-[10px] text-amber-400/80 mt-0.5">Cần xử lý theo phản hồi Biên tập viên</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {onResubmitNoteChange && (
        <div className="mb-5 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand mb-1.5">
            <MessageSquareQuote size={13} />
            {isRevisionResubmit ? MANGAKA_RESUBMIT_NOTE_LABEL : 'Lời nhắn cho Biên tập viên'}
          </div>
          <p className="text-[11px] text-text-muted mb-2">
            {isRevisionResubmit ? MANGAKA_RESUBMIT_NOTE_HINT : 'Bạn có thể để lại vài lời nhắn gửi cho Biên tập viên (không bắt buộc).'}
          </p>
          <textarea
            value={resubmitNote}
            onChange={(e) => onResubmitNoteChange(e.target.value)}
            placeholder={isRevisionResubmit ? MANGAKA_RESUBMIT_NOTE_PLACEHOLDER : 'Nhập lời nhắn...'}
            rows={3}
            maxLength={2000}
            className="w-full px-3 py-2.5 bg-bg-primary border border-border-custom rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 resize-y min-h-[80px]"
          />
          <p className="text-[10px] text-text-muted mt-1 text-right">{resubmitNote.length}/2000</p>
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || !canSubmit}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border-none cursor-pointer transition-all duration-200 ${
          isSubmitting || !canSubmit
            ? 'bg-brand/30 text-white/50 cursor-not-allowed'
            : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:-translate-y-0.5 active:translate-y-0'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Đang gửi...
          </>
        ) : (
          <>
            <SendHorizonal size={16} />
            {isRevisionResubmit ? 'Gửi lại xét duyệt' : SUBMIT_FOR_REVIEW_LABEL}
          </>
        )}
      </button>

      {!canSubmit && !isSubmitting && (
        <p className="text-[10px] text-center text-text-muted mt-2">
          Cần tải lên {NEMU_MANUSCRIPT_LABEL.toLowerCase()} trước khi gửi.
        </p>
      )}
    </div>
  );
};
