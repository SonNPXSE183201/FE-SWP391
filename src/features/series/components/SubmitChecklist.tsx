import { SendHorizonal, CheckCircle2, Circle } from 'lucide-react';

interface ChecklistItem {
  label: string;
  completed: boolean;
}

interface SubmitChecklistProps {
  items: ChecklistItem[];
  isSubmitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}

export const SubmitChecklist = ({ items, isSubmitting, canSubmit, onSubmit }: SubmitChecklistProps) => {
  return (
    <div className="bg-bg-secondary border border-brand/15 rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <SendHorizonal size={16} className="text-brand" />
        <h2 className="text-sm font-semibold text-text-primary">Submit xét duyệt</h2>
      </div>
      <p className="text-xs text-text-muted mb-4">
        Khi submit, Series sẽ chuyển sang trạng thái <strong className="text-warning">Chờ duyệt</strong> và Editor phụ trách sẽ nhận được thông báo để đánh giá.
      </p>

      <div className="flex items-center gap-3">
        {/* Checklist */}
        <div className="flex-1 space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center ${item.completed ? 'bg-success/15 text-success' : 'bg-bg-surface text-text-muted border border-border-custom'}`}>
                {item.completed ? <CheckCircle2 size={12} /> : <Circle size={10} />}
              </div>
              <span className={item.completed ? 'text-text-primary' : 'text-text-muted'}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !canSubmit}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border-none cursor-pointer transition-all duration-200
            ${isSubmitting || !canSubmit
              ? 'bg-brand/30 text-white/50 cursor-not-allowed'
              : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <SendHorizonal size={16} />
              Submit xét duyệt
            </>
          )}
        </button>
      </div>
    </div>
  );
};
