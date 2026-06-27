import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, CreditCard, Scale } from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import type { ReconciliationRecord } from '../types/reconciliation.types';
import { toReconciliationStatus } from '../types/reconciliation.types';
import {
  formatReconciliationCurrency,
  formatPaymentStatus,
  formatReconciliationDate,
  formatSignedReconciliationAmount,
  getAmountToneClass,
  getReconciliationStatusHelp,
  getTransactionTypeLabel,
  inferTransactionType,
  isVnpayReconciliationRecord,
} from '../utils/reconciliation.utils';
import { getRoleBadgeStyle, getRoleLabel } from '../../../utils/roleDisplay';

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
  icon: typeof X;
};

type ReconciliationDetailModalProps = {
  record: ReconciliationRecord;
  statusCfg: StatusConfig;
  onClose: () => void;
  typeBadge: ReactNode;
};

export const ReconciliationDetailModal = ({
  record,
  statusCfg,
  onClose,
  typeBadge,
}: ReconciliationDetailModalProps) => {
  const status = toReconciliationStatus(record.status);
  const isVnpay = isVnpayReconciliationRecord(record);
  const primaryAmount = record.internalAmount ?? record.vnpayAmount ?? 0;
  const amountMismatch = (record.vnpayAmount ?? 0) !== (record.internalAmount ?? 0);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-md shadow-xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-border-custom">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {typeBadge}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                <statusCfg.icon size={11} />
                {statusCfg.label}
              </span>
              <HelpTip
                title="Trạng thái đối soát"
                ariaLabel="Giải thích trạng thái đối soát"
                placement="bottom-start"
                width="18rem"
                autoCloseMs={0}
                size="sm"
                content={getReconciliationStatusHelp(status)}
              />
            </div>
            <p className="text-sm font-semibold text-text-primary mt-2 truncate">{record.userName}</p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {getRoleLabel(record.userRole)} · {formatReconciliationDate(record.internalDate || record.vnpayDate)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Số tiền chính */}
          <div className="rounded-xl bg-bg-primary border border-border-custom px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">{getTransactionTypeLabel(record)}</p>
            <p className={`text-2xl font-bold tabular-nums mt-1 ${getAmountToneClass(primaryAmount)}`}>
              {formatSignedReconciliationAmount(primaryAmount)}
            </p>
            <p className="text-[11px] text-text-muted mt-1">{formatPaymentStatus(record.internalStatus || record.vnpayStatus)}</p>
          </div>

          {/* Mô tả */}
          {record.description && (
            <p className="text-xs text-text-secondary leading-relaxed">{record.description}</p>
          )}

          {/* So sánh VNPay — chỉ giao dịch cổng thanh toán */}
          {isVnpay && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border-custom bg-bg-primary/60 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <CreditCard size={12} className="text-info" />
                  <span className="text-[10px] font-bold text-info uppercase">VNPay</span>
                </div>
                <p className={`text-sm font-bold tabular-nums ${amountMismatch ? 'text-warning' : 'text-text-primary'}`}>
                  {formatReconciliationCurrency(record.vnpayAmount ?? 0)}
                </p>
                <p className="text-[10px] text-text-muted mt-1">{formatPaymentStatus(record.vnpayStatus)}</p>
              </div>
              <div className="rounded-lg border border-border-custom bg-bg-primary/60 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Scale size={12} className="text-success" />
                  <span className="text-[10px] font-bold text-success uppercase">Hệ thống</span>
                </div>
                <p className={`text-sm font-bold tabular-nums ${amountMismatch ? 'text-warning' : 'text-text-primary'}`}>
                  {formatSignedReconciliationAmount(record.internalAmount ?? 0)}
                </p>
                <p className="text-[10px] text-text-muted mt-1">{formatPaymentStatus(record.internalStatus)}</p>
              </div>
            </div>
          )}

          {/* Chênh lệch */}
          {isVnpay && amountMismatch && (
            <div className="flex items-start gap-2 rounded-lg bg-warning/5 border border-warning/20 px-3 py-2.5">
              <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
              <div className="text-xs text-text-secondary">
                <span className="font-semibold text-warning">Chênh lệch số tiền — </span>
                VNPay {formatReconciliationCurrency(record.vnpayAmount ?? 0)} vs Hệ thống{' '}
                {formatSignedReconciliationAmount(record.internalAmount ?? 0)}
              </div>
            </div>
          )}

          {/* Ghi chú */}
          {record.discrepancyNote && status !== 'Matched' && (
            <div className="rounded-lg bg-bg-primary border border-border-custom px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Ghi chú</p>
              <p className="text-xs text-text-secondary leading-relaxed">{record.discrepancyNote}</p>
            </div>
          )}

          {/* Meta footer */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-custom/60">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeStyle(record.userRole)}`}>
              {getRoleLabel(record.userRole)}
            </span>
            {!isVnpay && inferTransactionType(record) === 'funding' && (
              <span className="text-[10px] text-text-muted">Giao dịch nội bộ · không qua VNPay</span>
            )}
            {!isVnpay && inferTransactionType(record) === 'platform_topup' && (
              <span className="text-[10px] text-text-muted">Nạp quỹ Admin · nội bộ</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
