import {
  ArrowDownToLine, ArrowUpFromLine, CreditCard, ExternalLink,
} from 'lucide-react';
import { AnimatedModal } from '../../../components/common/animation';
import { formatVND, formatVNDInput, parseVND, VIETNAM_BANKS } from '../constants/wallet.constants';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { useWalletActions } from '../hooks/useWalletActions';

interface WalletActionModalProps {
  mode: 'deposit' | 'withdraw';
  maxWithdrawAmount?: number;
  onClose: () => void;
  onSuccess?: () => void; // Thêm callback onSuccess để reload data
}

export const WalletActionModal = ({ mode, maxWithdrawAmount, onClose, onSuccess }: WalletActionModalProps) => {
  const {
    amount,
    setAmount,
    loading,
    error,
    bankName,
    setBankName,
    bankAccountNumber,
    setBankAccountNumber,
    bankAccountName,
    setBankAccountName,
    presetAmounts,
    handleSubmit,
    isBankAccountNameInvalid,
    isBankAccountNumberInvalid,
    isFormInvalid,
  } = useWalletActions(mode, maxWithdrawAmount, onClose, onSuccess);

  return (
    <AnimatedModal
      open
      onClose={onClose}
      panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-md shadow-lg-custom"
    >
        <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mode === 'deposit' ? 'bg-success/10' : 'bg-danger/10'}`}>
              {mode === 'deposit'
                ? <ArrowDownToLine size={18} className="text-success" />
                : <ArrowUpFromLine size={18} className="text-danger" />
              }
            </div>
            <h2 className="text-base font-semibold text-text-primary">
              {mode === 'deposit' ? 'Nạp tiền (VNPay)' : 'Rút tiền'}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-danger bg-danger/10 rounded-xl border border-danger/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Số tiền (VND)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatVNDInput(amount)}
                onChange={(e) => {
                  const digits = parseVND(e.target.value);
                  setAmount(digits ? String(digits) : '');
                }}
                placeholder="Nhập số tiền..."
                className="w-full pl-4 pr-12 py-3 bg-bg-surface border border-border-custom rounded-xl text-base font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted font-medium pointer-events-none">VND</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${amount === String(a)
                    ? 'bg-brand/15 text-brand border-brand/30'
                    : 'bg-bg-surface text-text-secondary border-border-custom hover:border-brand/20'
                  }`}
              >
                {formatVND(a)}
              </button>
            ))}
          </div>

          {mode === 'withdraw' && (
            <>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Ngân hàng</label>
                <CustomSelect
                  options={VIETNAM_BANKS.map((bank) => ({ value: bank, label: bank }))}
                  value={bankName}
                  onChange={setBankName}
                  icon={<CreditCard size={14} />}
                  searchable
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  placeholder="VD: NGUYEN VAN A"
                  className={`w-full px-3 py-2.5 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all uppercase ${isBankAccountNameInvalid ? 'border-danger focus:border-danger' : 'border-border-custom focus:border-brand/50'}`}
                />
                {isBankAccountNameInvalid && (
                  <p className="text-[11px] text-danger mt-1.5 ml-1">
                    Tên không được chứa số, ký tự đặc biệt, và phải viết hoa không dấu.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Số tài khoản</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="VD: 1234567890"
                  className={`w-full px-3 py-2.5 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all ${isBankAccountNumberInvalid ? 'border-danger focus:border-danger' : 'border-border-custom focus:border-brand/50'}`}
                />
                {isBankAccountNumberInvalid && (
                  <p className="text-[11px] text-danger mt-1.5 ml-1">
                    Số tài khoản phải từ 9 đến 14 chữ số.
                  </p>
                )}
              </div>
              <div className="bg-info/5 border border-info/20 rounded-xl p-3">
                <p className="text-[11px] text-info">
                  Chỉ rút được từ <span className="font-semibold">Quỹ khả dụng</span> (WithdrawableBalance).
                </p>
              </div>
            </>
          )}

          {mode === 'deposit' && (
            <div className="flex items-center gap-2 p-3 bg-bg-surface rounded-xl">
              <CreditCard size={16} className="text-text-muted" />
              <span className="text-[11px] text-text-secondary">Thanh toán qua cổng VNPay Sandbox</span>
              <ExternalLink size={12} className="text-text-muted ml-auto" />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-custom flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            Hủy
          </button>
          <button onClick={handleSubmit} disabled={loading || !amount || (mode === 'withdraw' && isFormInvalid)} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${loading || !amount || (mode === 'withdraw' && isFormInvalid) ? 'bg-brand/40 text-white/60 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover text-white shadow-brand'
            }`}>
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
            ) : mode === 'deposit' ? (
              <><ArrowDownToLine size={14} />Nạp tiền</>
            ) : (
              <><ArrowUpFromLine size={14} />Rút tiền</>
            )}
          </button>
        </div>
    </AnimatedModal>
  );
};
