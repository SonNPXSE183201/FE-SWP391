import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDownToLine, ArrowUpFromLine, CreditCard, ExternalLink,
} from 'lucide-react';
import { formatVND, MOCK_WALLET } from '../../wallet';
import { CustomSelect } from '../../../components/common/CustomSelect';

interface WalletActionModalProps {
  mode: 'deposit' | 'withdraw';
  onClose: () => void;
}

export const WalletActionModal = ({ mode, onClose }: WalletActionModalProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const presetAmounts = mode === 'deposit'
    ? [500000, 1000000, 2000000, 5000000]
    : [500000, 1000000, 2000000];

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-md shadow-lg-custom animate-modal-enter">
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
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Số tiền (VND)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền..."
              className="w-full px-4 py-3 bg-bg-surface border border-border-custom rounded-xl text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  amount === String(a)
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
                  options={[
                    { value: 'Vietcombank', label: 'Vietcombank' },
                    { value: 'Techcombank', label: 'Techcombank' },
                    { value: 'MB Bank', label: 'MB Bank' },
                    { value: 'BIDV', label: 'BIDV' },
                  ]}
                  value="Vietcombank"
                  onChange={() => {}}
                  icon={<CreditCard size={14} />}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Số tài khoản</label>
                <input type="text" placeholder="VD: 1234567890" className="w-full px-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-all" />
              </div>
              <div className="bg-info/5 border border-info/20 rounded-xl p-3">
                <p className="text-[11px] text-info">
                  Chỉ rút được từ <span className="font-semibold">Quỹ khả dụng</span> (WithdrawableBalance).
                  Hiện có: <span className="font-bold">{formatVND(MOCK_WALLET.withdrawableBalance)}</span>
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
          <button onClick={handleSubmit} disabled={loading || !amount} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
            loading || !amount ? 'bg-brand/40 text-white/60 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover text-white shadow-brand'
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
      </div>
    </div>,
    document.body,
  );
};
