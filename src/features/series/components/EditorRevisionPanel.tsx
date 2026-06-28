import { useMemo, useState } from 'react';
import { Banknote, ChevronDown, Loader2, MessageSquareQuote, RotateCcw, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  parseEditorRevisionNote,
  CHECKLIST_LABELS,
  REVISION_FIELD_LABELS,
  type ChecklistItemId,
} from '../utils/editorRevision.utils';

interface EditorRevisionPanelProps {
  editorNote: string;
  estimatedBudget: number;
  onSaveBudget: (amount: number) => Promise<void>;
  onScrollToSubmit?: () => void;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatCurrencyInput = (value: string): string => {
  const numericValue = value.replace(/[^0-9]/g, '');
  if (!numericValue) return '';
  return new Intl.NumberFormat('vi-VN').format(Number(numericValue));
};

const parseMangakaBudgetFromNote = (note: string): number | null => {
  const match = note.match(/Mangaka đề xuất:\s*([\d.,]+)\s*VND/i);
  if (!match?.[1]) return null;
  const n = Number(match[1].replace(/[^0-9]/g, ''));
  return n > 0 ? n : null;
};

const SHORT_LABELS: Record<ChecklistItemId, string> = {
  synopsis: REVISION_FIELD_LABELS.synopsis,
  genre: REVISION_FIELD_LABELS.genre,
  name: REVISION_FIELD_LABELS.name,
  budget: REVISION_FIELD_LABELS.budget,
};

export const EditorRevisionPanel = ({
  editorNote,
  estimatedBudget,
  onSaveBudget,
  onScrollToSubmit,
}: EditorRevisionPanelProps) => {
  const parsed = parseEditorRevisionNote(editorNote);
  const { checklistIds, editorComment } = parsed;

  const failedItems = useMemo(() => {
    if (checklistIds.length > 0) {
      return checklistIds.map((id) => ({
        id,
        label: SHORT_LABELS[id] ?? CHECKLIST_LABELS[id],
      }));
    }
    return parsed.bulletLines.map((label, idx) => ({
      id: `bullet-${idx}` as ChecklistItemId,
      label,
    }));
  }, [checklistIds, parsed.bulletLines]);

  const nonBudgetItems = failedItems.filter((item) => item.id !== 'budget');
  const needsBudgetAction = checklistIds.includes('budget');

  const mangakaBudget = parseMangakaBudgetFromNote(editorNote);
  const editorBudget = estimatedBudget;

  const budgetSeed = estimatedBudget > 0 ? String(estimatedBudget) : '';
  const [budgetInput, setBudgetInput] = useState(budgetSeed);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [budgetSeedSeen, setBudgetSeedSeen] = useState(budgetSeed);

  if (budgetSeed !== budgetSeedSeen) {
    setBudgetSeedSeen(budgetSeed);
    setBudgetInput(budgetSeed);
  }

  const budgetNum = budgetInput ? Number(budgetInput.replace(/[^0-9]/g, '')) : 0;
  const budgetDirty = budgetNum > 0 && budgetNum !== estimatedBudget;

  const handleSaveBudget = async () => {
    if (budgetNum <= 0) {
      toast.error('Ngân sách phải lớn hơn 0.');
      return;
    }
    setIsSavingBudget(true);
    try {
      await onSaveBudget(budgetNum);
      toast.success('Đã cập nhật ngân sách.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Cập nhật ngân sách thất bại.';
      toast.error(msg);
    } finally {
      setIsSavingBudget(false);
    }
  };

  if (failedItems.length === 0 && !editorComment) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/25 bg-bg-secondary animate-fade-in">
      <div className="flex items-start gap-3 px-5 py-4 border-b border-amber-500/10">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
          <RotateCcw size={18} className="text-amber-400" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">Editor yêu cầu chỉnh sửa</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Chỉ cần xử lý {failedItems.length > 0 ? `${failedItems.length} mục` : 'phản hồi'} bên dưới, rồi gửi lại xét duyệt.
          </p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {editorComment && (
          <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand mb-1.5">
              <MessageSquareQuote size={13} />
              Nhận xét
            </div>
            <p className="text-sm text-text-primary leading-relaxed">{editorComment}</p>
          </div>
        )}

        {nonBudgetItems.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-2">
              Cần chỉnh sửa
            </p>
            <ul className="space-y-1.5">
              {nonBudgetItems.map((item) => (
                <li
                  key={`${item.id}-${item.label}`}
                  className="flex items-center gap-2 text-sm text-text-primary"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {needsBudgetAction && (
          <div className="rounded-lg border border-border-custom bg-bg-surface/50 px-4 py-3 space-y-3">
            <div className="flex items-center gap-2">
              <Banknote size={15} className="text-brand" />
              <p className="text-sm font-medium text-text-primary">Ngân sách</p>
            </div>

            {mangakaBudget != null && mangakaBudget !== editorBudget && (
              <p className="text-xs text-text-muted">
                Bạn đề xuất{' '}
                <span className="line-through text-text-secondary">{formatCurrency(mangakaBudget)}</span>
                {' → '}
                Editor đề xuất{' '}
                <span className="font-semibold text-brand">{formatCurrency(editorBudget)}</span>
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={budgetInput ? formatCurrencyInput(budgetInput) : ''}
                onChange={(e) => setBudgetInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Nhập ngân sách (VND)"
                className="flex-1 px-3 py-2.5 bg-bg-primary border border-border-custom rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand/50"
              />
              <button
                type="button"
                onClick={handleSaveBudget}
                disabled={isSavingBudget || !budgetDirty}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isSavingBudget ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Lưu
              </button>
            </div>
          </div>
        )}
      </div>

      {onScrollToSubmit && (
        <div className="border-t border-border-custom/50 px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={onScrollToSubmit}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover bg-transparent border-none cursor-pointer"
          >
            Gửi lại xét duyệt
            <ChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
