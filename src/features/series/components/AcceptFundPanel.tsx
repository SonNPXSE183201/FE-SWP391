import { Banknote, CheckCircle2, Loader2, Wallet } from 'lucide-react';

const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

interface AcceptFundPanelProps {
  approvedBudget: number;
  hasContract: boolean;
  isAccepting: boolean;
  onAccept: () => void;
}

export const AcceptFundPanel = ({
  approvedBudget,
  hasContract,
  isAccepting,
  onAccept,
}: AcceptFundPanelProps) => (
  <div className="bg-bg-secondary border border-success/20 rounded-xl p-5 animate-fade-in">
    <div className="flex items-center gap-2 mb-2">
      <Banknote size={16} className="text-success" />
      <h2 className="text-sm font-semibold text-text-primary">Gói vốn đã được Hội đồng duyệt</h2>
    </div>

    <p className="text-xs text-text-muted leading-relaxed">
      Hội đồng biên tập đã phê duyệt ngân sách sản xuất. Bấm{' '}
      <strong className="text-text-primary">Chấp nhận vốn</strong> để kích hoạt series và nhận tiền vào{' '}
      <strong className="text-text-primary">Setup Fund</strong> trong ví.
    </p>

    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
          <Wallet size={18} className="text-success" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
            Ngân sách duyệt
          </p>
          <p className="text-lg font-bold text-success truncate">{formatVnd(approvedBudget)}</p>
        </div>
      </div>

      <div className="w-full sm:w-auto flex flex-col items-end gap-2 shrink-0">
        <button
          type="button"
          onClick={onAccept}
          disabled={isAccepting || !hasContract}
          className={`
            w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2
            px-6 py-3 rounded-xl text-sm font-medium border-none transition-all duration-200
            ${(isAccepting || !hasContract)
              ? 'bg-success/50 text-white cursor-not-allowed'
              : 'bg-success text-white cursor-pointer hover:opacity-90 shadow-sm hover:-translate-y-0.5 active:translate-y-0'
            }
          `}
        >
          {isAccepting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Chấp nhận vốn
            </>
          )}
        </button>
        {!hasContract && (
          <p className="text-[11px] text-danger font-medium m-0 max-w-[200px] text-right">
            Vui lòng đợi Admin tạo Hợp đồng trước khi nhận vốn.
          </p>
        )}
      </div>
    </div>
  </div>
);
