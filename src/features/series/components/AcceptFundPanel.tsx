import { Banknote, CheckCircle2, Loader2, Wallet, XCircle } from 'lucide-react';

const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

interface AcceptFundPanelProps {
  estimatedBudget: number;
  approvedBudget: number;
  hasContract: boolean;
  isAccepting: boolean;
  isDeclining: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const AcceptFundPanel = ({
  estimatedBudget,
  approvedBudget,
  hasContract,
  isAccepting,
  isDeclining,
  onAccept,
  onDecline,
}: AcceptFundPanelProps) => {
  const diff = approvedBudget - estimatedBudget;
  const busy = isAccepting || isDeclining;

  return (
    <div className="bg-bg-secondary border border-success/20 rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Banknote size={16} className="text-success" />
        <h2 className="text-sm font-semibold text-text-primary">Gói vốn đã được Hội đồng duyệt</h2>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">
        Hội đồng đã chốt ngân sách sản xuất. Xem so sánh bên dưới và chọn{' '}
        <strong className="text-text-primary">Chấp nhận vốn</strong> hoặc{' '}
        <strong className="text-text-primary">Từ chối</strong> để quay về bản nháp thương lượng lại.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border-custom bg-bg-primary p-4">
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Bạn đề xuất</p>
          <p className="text-lg font-bold text-text-primary mt-1">{formatVnd(estimatedBudget)}</p>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <p className="text-[10px] uppercase tracking-wider text-success font-medium">Hội đồng duyệt</p>
          <p className="text-lg font-bold text-success mt-1">{formatVnd(approvedBudget)}</p>
          {diff !== 0 && (
            <p className={`text-[11px] mt-1 ${diff > 0 ? 'text-success' : 'text-amber-400'}`}>
              {diff > 0 ? `Cao hơn ${formatVnd(diff)}` : `Thấp hơn ${formatVnd(Math.abs(diff))}`}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
            <Wallet size={18} className="text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Nhận vào Setup Fund</p>
            <p className="text-sm text-text-secondary leading-snug">
              Tiền chỉ dùng khóa trả lương Assistant — không rút về tài khoản cá nhân.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onDecline}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-danger/30 bg-danger/5 text-danger cursor-pointer hover:bg-danger/10 transition-all disabled:opacity-50"
          >
            {isDeclining ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            Từ chối
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={busy || !hasContract}
            className={`
              inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border-none transition-all duration-200
              ${(busy || !hasContract)
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
        </div>
      </div>

      {!hasContract && (
        <p className="text-[11px] text-danger font-medium mt-3 m-0">
          Vui lòng đợi Admin tạo Hợp đồng trước khi nhận vốn.
        </p>
      )}
    </div>
  );
};
