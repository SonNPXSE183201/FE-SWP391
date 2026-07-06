import { createPortal } from 'react-dom';
import { X, Receipt, Clock, ArrowRightLeft, Shield, Banknote, Hash } from 'lucide-react';
import { TX_TYPE_CONFIG, formatVND } from '../constants';
import type { TransactionDto } from '../../../api/generated/types';
import { getTransactionAmountDisplay, formatTransactionDateTime, getTransactionDescription, normalizeTransactionType } from '../utils';

interface TransactionDetailModalProps {
  transaction: TransactionDto;
  onClose: () => void;
}

export const TransactionDetailModal = ({ transaction, onClose }: TransactionDetailModalProps) => {
  const txType = normalizeTransactionType(transaction.type ?? '');
  const cfg = TX_TYPE_CONFIG[txType] || { icon: Receipt, bg: 'bg-bg-surface', color: 'text-text-muted', label: transaction.type, sign: '' as const };
  const TxIcon = cfg.icon;
  const amountDisplay = getTransactionAmountDisplay(transaction);
  const description = getTransactionDescription(transaction);

  const date = formatTransactionDateTime(transaction.createAt);

  const setupFundAmount = Number(transaction.setupFundAmount ?? 0);
  const withdrawableAmount = Number(transaction.withdrawableAmount ?? 0);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-lg shadow-lg-custom animate-modal-enter">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center`}>
              <TxIcon size={18} className={cfg.color} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">{cfg.label}</h2>
              <span className="text-[10px] text-text-muted font-mono">{transaction.referenceCode || '—'}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg-surface hover:bg-bg-primary flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Amount */}
        <div className="px-6 py-6 text-center border-b border-border-custom">
          <div className={`text-3xl font-bold font-mono ${amountDisplay.colorClass}`}>
            {amountDisplay.sign}{formatVND(amountDisplay.value)}
          </div>
          <p className="text-xs text-text-muted mt-2">{description}</p>
        </div>

        {/* Details */}
        <div className="px-6 py-4 space-y-3">
          {/* Date */}
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-xs text-text-muted">
              <Clock size={14} /> Thời gian
            </span>
            <span className="text-sm text-text-primary">{date}</span>
          </div>

          {/* Reference Code */}
          {transaction.referenceCode && (
            <div className="flex items-center justify-between py-2 border-t border-border-custom/50">
              <span className="flex items-center gap-2 text-xs text-text-muted">
                <Hash size={14} /> Mã tham chiếu
              </span>
              <span className="text-sm text-text-primary font-mono">{transaction.referenceCode}</span>
            </div>
          )}

          {/* Reference ID (Task) */}
          {transaction.referenceId != null && (
            <div className="flex items-center justify-between py-2 border-t border-border-custom/50">
              <span className="flex items-center gap-2 text-xs text-text-muted">
                <ArrowRightLeft size={14} /> ID tham chiếu
              </span>
              <span className="text-sm text-text-primary font-mono">{String(transaction.referenceId)}</span>
            </div>
          )}

          {/* Fund Breakdown */}
          {(setupFundAmount !== 0 || withdrawableAmount !== 0) && (
            <div className="border-t border-border-custom/50 pt-3">
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-2">Chi tiết quỹ</p>
              <div className="grid grid-cols-2 gap-3">
                {setupFundAmount !== 0 && (
                  <div className="bg-info/5 border border-info/15 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield size={12} className="text-info" />
                      <span className="text-[10px] text-info font-medium">Quỹ sản xuất</span>
                    </div>
                    <span className={`text-sm font-bold font-mono ${setupFundAmount >= 0 ? 'text-info' : 'text-danger'}`}>
                      {setupFundAmount >= 0 ? '+' : ''}{formatVND(Math.abs(setupFundAmount))}
                    </span>
                  </div>
                )}
                {withdrawableAmount !== 0 && (
                  <div className="bg-success/5 border border-success/15 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Banknote size={12} className="text-success" />
                      <span className="text-[10px] text-success font-medium">Quỹ khả dụng</span>
                    </div>
                    <span className={`text-sm font-bold font-mono ${withdrawableAmount >= 0 ? 'text-success' : 'text-danger'}`}>
                      {withdrawableAmount >= 0 ? '+' : ''}{formatVND(Math.abs(withdrawableAmount))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-custom flex justify-end">
          <button onClick={onClose} className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
