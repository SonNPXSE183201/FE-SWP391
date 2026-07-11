import type { ReconciliationRecord, ReconciliationStatus } from '../types/reconciliation.types';
import { NEMU_FUNDING_LABEL } from '../../../constants/seriesCopy';
import { formatVND } from '../../../utils/currency';

export const formatReconciliationCurrency = (value: number): string => formatVND(value);

export const inferTransactionType = (record: ReconciliationRecord): 'deposit' | 'withdraw' | 'funding' | 'platform_topup' | 'other' => {
  const text = `${record.description ?? ''} ${record.referenceCode ?? ''}`.toLowerCase();
  if (record.referenceCode?.startsWith('FUND-') || text.includes('production_funding') || text.includes('cấp vốn')) {
    return 'funding';
  }
  if (record.referenceCode?.startsWith('PLT') || text.includes('platform_topup') || text.includes('ví chung')) {
    return 'platform_topup';
  }
  if (text.includes('withdraw') || text.includes('rút') || record.referenceCode?.startsWith('WDR')) {
    return 'withdraw';
  }
  if (text.includes('deposit') || text.includes('nạp tiền') || record.referenceCode?.startsWith('DEP')) {
    return 'deposit';
  }
  return 'other';
};

export const getTransactionTypeLabel = (record: ReconciliationRecord): string => {
  switch (inferTransactionType(record)) {
    case 'deposit':
      return 'Nạp tiền';
    case 'withdraw':
      return 'Rút tiền';
    case 'funding':
      return NEMU_FUNDING_LABEL;
    case 'platform_topup':
      return 'Nạp quỹ NXB';
    default:
      return 'Khác';
  }
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  Success: 'Thành công',
  Completed: 'Hoàn tất',
  Failed: 'Thất bại',
  Pending: 'Đang chờ',
  Processing: 'Đang xử lý',
  'Not Found': 'Không tìm thấy',
};

export const formatPaymentStatus = (status?: string | null): string =>
  PAYMENT_STATUS_LABELS[status ?? ''] ?? status ?? '—';

export const getReconciliationStatusHelp = (status: ReconciliationStatus): string => {
  switch (status) {
    case 'Matched':
      return 'Giao dịch khớp — trạng thái và số tiền nhất quán.';
    case 'Mismatch':
      return 'Cần kiểm tra — trạng thái không khớp (ví dụ VNPay thành công nhưng hệ thống thất bại).';
    case 'Missing':
      return 'Thiếu mã ReferenceCode — không thể đối soát đầy đủ với VNPay.';
    case 'Pending':
      return 'Giao dịch đang chờ xác nhận hoặc xử lý.';
  }
};

export const isVnpayReconciliationRecord = (record: ReconciliationRecord): boolean => {
  const type = inferTransactionType(record);
  return type === 'deposit' || type === 'withdraw';
};

export const formatSignedReconciliationAmount = (value: number): string => {
  if (value === 0) return '0 ₫';
  const abs = formatReconciliationCurrency(Math.abs(value));
  return value < 0 ? `−${abs}` : abs;
};

export const getAmountToneClass = (value: number): string => {
  if (value < 0) return 'text-danger';
  if (value > 0) return 'text-success';
  return 'text-text-primary';
};

export const formatReconciliationDate = (iso?: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};
