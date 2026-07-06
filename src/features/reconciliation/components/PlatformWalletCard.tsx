import { useState } from 'react';
import { Building2, ChevronDown, ChevronUp, Loader2, Plus, Wallet } from 'lucide-react';
import { usePlatformWallet, useTopUpPlatformWallet } from '../hooks/usePlatformWallet';
import { usePlatformWalletDepositListener } from '../hooks/usePlatformWalletDepositListener';
import { formatReconciliationCurrency } from '../utils/reconciliation.utils';
import { showAppError } from '../../../utils/appToast';
import { formatVND } from '../../wallet/constants';
import { HelpTip } from '../../../components/common/HelpTip';


type PlatformWalletCardProps = {
  className?: string;
};

export const PlatformWalletCard = ({ className = '' }: PlatformWalletCardProps) => {
  usePlatformWalletDepositListener();
  const { data, isLoading, isError, refetch } = usePlatformWallet();
  const topUpMutation = useTopUpPlatformWallet();
  const [amount, setAmount] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);

  const parsedAmount = Number(amount.replace(/\D/g, '') || 0);

  const handleTopUp = () => {
    if (!parsedAmount || parsedAmount < 10000 || parsedAmount > 1000000000) {
      showAppError('Số tiền nạp không hợp lệ (từ 10.000 đến 1.000.000.000 VND)');
      return;
    }
    topUpMutation.mutate(
      { amount: parsedAmount },
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
          <div className="mt-3 pt-3 border-t border-border-custom space-y-2 animate-fade-in-up">
            
            <div>
              <div className="flex items-center gap-1.5 px-1 mb-1.5">
                <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">Số tiền nạp (VND)</label>
                <HelpTip content="Giới hạn mỗi giao dịch từ 10.000 VND đến 1.000.000.000 VND. Thông tin nạp quỹ sẽ được tự động ghi nhận." />
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={amount ? new Intl.NumberFormat('vi-VN').format(Number(amount)) : ''}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="Ví dụ: 50.000.000"
                className="w-full px-3 py-2.5 bg-bg-primary border border-border-custom rounded-lg text-sm font-medium text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all placeholder:text-text-muted/40"
              />
              {parsedAmount > 0 && (
                <div className="flex items-center px-1 mt-1.5">
                  {parsedAmount < 10000 && (
                    <p className="text-[11px] text-danger font-medium animate-fade-in">Tối thiểu 10.000 VND</p>
                  )}
                  {parsedAmount > 1000000000 && (
                    <p className="text-[11px] text-danger font-medium animate-fade-in">Tối đa 1.000.000.000 VND</p>
                  )}
                  {parsedAmount >= 10000 && parsedAmount <= 1000000000 && (
                    <p className="text-[11px] text-brand font-medium animate-fade-in">{formatVND(parsedAmount)}</p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-1.5">
              <button
                type="button"
                onClick={handleTopUp}
                disabled={topUpMutation.isPending || parsedAmount < 10000 || parsedAmount > 1000000000}
                className="w-full inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {topUpMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                Thanh toán qua VNPay
              </button>
              <p className="text-[10px] text-text-muted text-center leading-relaxed mt-2.5">
                Cổng thanh toán an toàn VNPay
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
