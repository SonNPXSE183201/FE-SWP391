import { useState } from 'react';
import { Building2, ChevronDown, ChevronUp, Loader2, Plus, Wallet } from 'lucide-react';
import { usePlatformWallet, useTopUpPlatformWallet } from '../hooks/usePlatformWallet';
import { usePlatformWalletDepositListener } from '../hooks/usePlatformWalletDepositListener';
import { formatReconciliationCurrency } from '../utils/reconciliation.utils';
import { showAppError } from '../../../utils/appToast';
import { formatVND } from '../../wallet/constants';

const QUICK_AMOUNTS = [
  { label: '100M', value: 100_000_000 },
  { label: '500M', value: 500_000_000 },
  { label: '1B', value: 1_000_000_000 },
];

type PlatformWalletCardProps = {
  className?: string;
};

export const PlatformWalletCard = ({ className = '' }: PlatformWalletCardProps) => {
  usePlatformWalletDepositListener();
  const { data, isLoading, isError, refetch } = usePlatformWallet();
  const topUpMutation = useTopUpPlatformWallet();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);

  const parsedAmount = Number(amount.replace(/\D/g, '') || 0);

  const handleTopUp = () => {
    if (!parsedAmount || parsedAmount < 10000) {
      showAppError('Số tiền nạp tối thiểu 10.000 VND');
      return;
    }
    topUpMutation.mutate(
      { amount: parsedAmount, note: note.trim() || undefined },
      {
        onSuccess: (paymentUrl) => {
          window.location.assign(paymentUrl);
        },
        onError: (err) => showAppError(err instanceof Error ? err.message : 'Khởi tạo nạp quỹ thất bại'),
      },
    );
  };

  return (
    <div className={`rounded-xl border border-border-custom bg-bg-secondary flex flex-col ${className}`}>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Ví hệ thống</p>
              <h2 className="text-sm font-semibold text-text-primary truncate">Quỹ chung NXB</h2>
            </div>
          </div>
          <span className="text-[10px] font-medium text-text-muted bg-bg-primary px-1.5 py-0.5 rounded border border-border-custom shrink-0">
            Hệ thống
          </span>
        </div>

        <div className="rounded-lg bg-bg-primary border border-border-custom px-3 py-3 mb-3">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Số dư khả dụng</p>
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-brand mt-2" />
          ) : isError ? (
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs text-brand mt-1 hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              Không tải được — thử lại
            </button>
          ) : (
            <p className="text-xl font-bold text-text-primary tabular-nums mt-0.5 leading-tight">
              {formatReconciliationCurrency(data?.balance ?? 0)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowTopUp((v) => !v)}
          className="mt-auto w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-brand/30 bg-brand/5 text-xs font-semibold text-brand hover:bg-brand/10 transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Nạp quỹ
          {showTopUp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showTopUp && (
          <div className="mt-3 pt-3 border-t border-border-custom space-y-2.5 animate-fade-in">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_AMOUNTS.map((qa) => (
                <button
                  key={qa.value}
                  type="button"
                  onClick={() => setAmount(String(qa.value))}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border cursor-pointer ${
                    parsedAmount === qa.value
                      ? 'bg-brand text-white border-brand'
                      : 'bg-bg-primary border-border-custom text-text-secondary'
                  }`}
                >
                  {qa.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="Số tiền VND"
              className="w-full px-2.5 py-2 bg-bg-primary border border-border-custom rounded-lg text-xs text-text-primary focus:outline-none focus:border-brand"
            />
            {parsedAmount > 0 && (
              <p className="text-[10px] text-brand font-medium -mt-1">{formatVND(parsedAmount)}</p>
            )}
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú (tuỳ chọn)"
              className="w-full px-2.5 py-2 bg-bg-primary border border-border-custom rounded-lg text-xs text-text-primary focus:outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={handleTopUp}
              disabled={topUpMutation.isPending || parsedAmount < 10000}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-brand text-white hover:bg-brand/90 cursor-pointer disabled:opacity-50"
            >
              {topUpMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Wallet size={13} />}
              Thanh toán VNPay
            </button>
            <p className="text-[10px] text-text-muted text-center leading-relaxed">
              Chuyển sang cổng VNPay Sandbox — thẻ test NCB · OTP 123456
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
