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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom/60 rounded-3xl w-full max-w-md shadow-2xl animate-modal-enter overflow-hidden flex flex-col max-h-[90vh]">
        {/* Decorative top gradient */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand/40 via-brand to-brand/40" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border-custom/50 bg-bg-secondary/95 backdrop-blur-xl z-10 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              {typeBadge}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-sm ${statusCfg.bg} ${statusCfg.color}`}>
                <statusCfg.icon size={12} strokeWidth={2.5} />
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
            <h2 className="text-lg font-bold text-text-primary mt-3 truncate tracking-tight">{record.userName}</h2>
            <p className="text-xs text-text-muted mt-1 font-medium flex items-center gap-1.5">
              {getRoleLabel(record.userRole)}
              <span className="w-1 h-1 rounded-full bg-border-custom"></span>
              {formatReconciliationDate(record.internalDate || record.vnpayDate)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-primary hover:scale-105 active:scale-95 transition-all bg-transparent border-none cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {/* Main Amount Card */}
          <div className={`relative overflow-hidden rounded-2xl p-6 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all hover:shadow-lg ${primaryAmount < 0 ? 'bg-gradient-to-br from-danger/10 via-danger/5 to-transparent border border-danger/20 hover:border-danger/40' : 'bg-gradient-to-br from-success/10 via-success/5 to-transparent border border-success/20 hover:border-success/40'}`}>
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-secondary">{getTransactionTypeLabel(record)}</p>
            <p className={`text-3xl sm:text-4xl font-extrabold tabular-nums mt-3 tracking-tight drop-shadow-sm ${getAmountToneClass(primaryAmount)}`}>
              {formatSignedReconciliationAmount(primaryAmount)}
            </p>
            <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-bg-surface/80 border border-border-custom/50 shadow-sm backdrop-blur-md">
              <span className={`w-1.5 h-1.5 rounded-full ${record.internalStatus === 'Success' || record.internalStatus === 'Completed' || record.vnpayStatus === 'Success' ? 'bg-success animate-pulse' : 'bg-warning'}`}></span>
              <p className="text-[11px] font-semibold text-text-primary tracking-wide">{formatPaymentStatus(record.internalStatus || record.vnpayStatus)}</p>
            </div>
          </div>

          {/* Description */}
          {record.description && (
            <div className="relative p-4 pl-5 rounded-xl bg-bg-primary/40 border border-border-custom/60 hover:border-brand/40 transition-all hover:shadow-sm overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand/70"></div>
              <p className="text-[13px] text-text-primary leading-relaxed font-medium">{record.description.replace(/Mangaka/g, 'Tác giả')}</p>
            </div>
          )}

          {/* VNPay Comparison */}
          {isVnpay && (
            <div className="grid grid-cols-2 gap-3">
              <div className="relative overflow-hidden rounded-xl border border-border-custom bg-bg-primary/30 p-4 transition-colors hover:border-info/30 group">
                <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-5 h-5 rounded-md bg-info/10 flex items-center justify-center">
                      <CreditCard size={12} className="text-info" />
                    </div>
                    <span className="text-[10px] font-bold text-info uppercase tracking-wider">VNPay</span>
                  </div>
                  <p className={`text-[15px] font-bold tabular-nums tracking-tight ${amountMismatch ? 'text-warning' : 'text-text-primary'}`}>
                    {formatReconciliationCurrency(record.vnpayAmount ?? 0)}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1 font-medium">{formatPaymentStatus(record.vnpayStatus)}</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-border-custom bg-bg-primary/30 p-4 transition-colors hover:border-success/30 group">
                <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-5 h-5 rounded-md bg-success/10 flex items-center justify-center">
                      <Scale size={12} className="text-success" />
                    </div>
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider">Hệ thống</span>
                  </div>
                  <p className={`text-[15px] font-bold tabular-nums tracking-tight ${amountMismatch ? 'text-warning' : 'text-text-primary'}`}>
                    {formatSignedReconciliationAmount(record.internalAmount ?? 0)}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1 font-medium">{formatPaymentStatus(record.internalStatus)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Discrepancy Warning */}
          {isVnpay && amountMismatch && (
            <div className="flex items-start gap-3 rounded-xl bg-warning/10 border border-warning/30 p-4 shadow-sm animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-warning" />
              </div>
              <div className="text-xs text-text-primary pt-0.5 leading-relaxed">
                <span className="font-bold text-warning block mb-1">Chênh lệch số tiền phát hiện</span>
                VNPay ghi nhận <span className="font-semibold">{formatReconciliationCurrency(record.vnpayAmount ?? 0)}</span> nhưng hệ thống ghi nhận <span className="font-semibold">{formatSignedReconciliationAmount(record.internalAmount ?? 0)}</span>. Cần kiểm tra lại.
              </div>
            </div>
          )}

          {/* Notes */}
          {record.discrepancyNote && status !== 'Matched' && (
            <div className="rounded-xl bg-bg-surface/50 border border-border-custom p-4">
              <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
                Ghi chú
              </p>
              <p className="text-[13px] text-text-secondary leading-relaxed">{record.discrepancyNote}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-bg-surface/50 border-t border-border-custom/50 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getRoleBadgeStyle(record.userRole)}`}>
              {getRoleLabel(record.userRole)}
            </span>
            {!isVnpay && inferTransactionType(record) === 'funding' && (
              <span className="text-[10px] font-medium text-text-muted bg-bg-primary px-2 py-1 rounded-md border border-border-custom/50">Giao dịch nội bộ</span>
            )}
            {!isVnpay && inferTransactionType(record) === 'platform_topup' && (
              <span className="text-[10px] font-medium text-text-muted bg-bg-primary px-2 py-1 rounded-md border border-border-custom/50">Nạp quỹ Admin</span>
            )}
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-bg-primary hover:bg-bg-surface border border-border-custom rounded-xl text-xs font-bold text-text-primary transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>,
    document.body,
  );
};
