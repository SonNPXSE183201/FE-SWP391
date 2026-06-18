import type { TransactionType } from '../../types/entities';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Lock,
  Unlock,
  ArrowRightLeft,
  Shield,
  Banknote,
} from 'lucide-react';

// ─── Transaction Type Config ─────────────────────────────────
export const TX_TYPE_CONFIG: Record<TransactionType, { label: string; color: string; bg: string; icon: typeof Wallet; sign: '+' | '-' | '' }> = {
  Deposit: { label: 'Nạp tiền', color: 'text-success', bg: 'bg-success/10', icon: ArrowDownToLine, sign: '+' },
  Withdraw: { label: 'Rút tiền', color: 'text-danger', bg: 'bg-danger/10', icon: ArrowUpFromLine, sign: '-' },
  Lock: { label: 'Khóa tiền', color: 'text-warning', bg: 'bg-warning/10', icon: Lock, sign: '-' },
  Unlock: { label: 'Mở khóa', color: 'text-info', bg: 'bg-info/10', icon: Unlock, sign: '+' },
  Escrow_Lock: { label: 'Tạm giữ tiền', color: 'text-warning', bg: 'bg-warning/10', icon: Lock, sign: '-' },
  Escrow_Unlock: { label: 'Hoàn trả quỹ', color: 'text-info', bg: 'bg-info/10', icon: Unlock, sign: '+' },
  Transfer: { label: 'Thanh toán', color: 'text-danger', bg: 'bg-danger/10', icon: ArrowRightLeft, sign: '-' },
  Funding: { label: 'Cấp vốn', color: 'text-brand', bg: 'bg-brand/10', icon: Shield, sign: '+' },
  Genkouryo: { label: 'Nhuận bút', color: 'text-success', bg: 'bg-success/10', icon: Banknote, sign: '+' },
};

export const TX_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'Deposit', label: 'Nạp tiền' },
  { value: 'Withdraw', label: 'Rút tiền' },
  { value: 'Lock', label: 'Khóa tiền' },
  { value: 'Unlock', label: 'Mở khóa' },
  { value: 'Escrow_Lock', label: 'Tạm giữ tiền' },
  { value: 'Escrow_Unlock', label: 'Hoàn trả quỹ' },
  { value: 'Transfer', label: 'Thanh toán' },
  { value: 'Funding', label: 'Cấp vốn' },
  { value: 'Genkouryo', label: 'Nhuận bút' },
];

// ─── VND Formatter ───────────────────────────────────────────
export const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
