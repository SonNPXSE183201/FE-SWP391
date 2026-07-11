import type { TransactionDto, WalletDto } from '../../../api/generated/types';
import { TX_TYPE_CONFIG } from '../constants/wallet.constants';
import type { TransactionType } from '../../../types/status.types';
import { parseApiDate } from '../../../utils/parseApiDate';
import { NEMU_FUNDING_LABEL } from '../../../constants/seriesCopy';

export { parseApiDate };

export const normalizeTransactionType = (type: string): TransactionType => {
  if (type === 'Withdrawal') return 'Withdraw';
  return type as TransactionType;
};

export const getWalletLockedAmount = (wallet: WalletDto): number =>
  Number(wallet.lockedFund ?? 0) + Number(wallet.lockedWithdrawable ?? 0);

export const getWalletTotalBalance = (wallet: WalletDto): number =>
  Number(wallet.setupFundBalance ?? 0) + Number(wallet.withdrawableBalance ?? 0);

const TX_TYPE_VI: Record<string, string> = {
  Deposit: 'Nạp tiền',
  Withdraw: 'Rút tiền',
  Withdrawal: 'Rút tiền',
  Withdrawal_Refund: 'Hoàn tiền rút',
  Lock: 'Khóa tiền',
  Unlock: 'Mở khóa',
  Escrow_Lock: 'Tạm giữ tiền',
  Escrow_Unlock: 'Hoàn trả quỹ',
  Escrow_Release: 'Giải ngân',
  Escrow_Refund: 'Hoàn tiền quỹ',
  Transfer: 'Thanh toán',
  Task_Payment: 'Thù lao Task',
  Funding: 'Cấp vốn',
  Production_Funding: NEMU_FUNDING_LABEL,
  Platform_TopUp: 'Nạp quỹ NXB',
  Genkouryo: 'Nhuận bút',
  Genkouryo_Payment: 'Thanh toán nhuận bút',
};

export const getTransactionDescription = (tx: TransactionDto): string => {
  const txType = normalizeTransactionType(tx.type ?? '');
  const typeVi = TX_TYPE_VI[txType] || txType;
  const txStatus = tx.status;
  const statusVi =
    txStatus === 'Success' ? 'Thành công' : txStatus === 'Pending' ? 'Đang xử lý' : txStatus === 'Failed' ? 'Thất bại' : txStatus;
  return `Giao dịch ${typeVi} (${statusVi})`;
};

export const formatTransactionDateTime = (iso?: string | null) =>
  parseApiDate(iso ?? '').toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  });

export const getTransactionAmountDisplay = (tx: TransactionDto) => {
  const txType = normalizeTransactionType(String(tx.type));
  const cfg = TX_TYPE_CONFIG[txType] ?? TX_TYPE_CONFIG[String(tx.type) as TransactionType];

  const setupFundAmount = Number(tx.setupFundAmount ?? 0);
  const withdrawableAmount = Number(tx.withdrawableAmount ?? 0);
  const amount = Number(tx.amount ?? 0);

  let sign = cfg?.sign;
  if (!sign) {
    if (withdrawableAmount < 0 || setupFundAmount < 0) sign = '-';
    else if (withdrawableAmount > 0 || setupFundAmount > 0) sign = '+';
    else sign = amount >= 0 ? '+' : '-';
  }

  const isDebit = sign === '-';
  const value = Math.abs(amount) || Math.abs(withdrawableAmount) || Math.abs(setupFundAmount);

  return {
    sign,
    isDebit,
    value,
    colorClass: isDebit ? 'text-danger' : 'text-success',
    label: cfg?.label ?? String(tx.type),
  };
};

const INCOME_TYPES = ['Deposit', 'Unlock', 'Genkouryo', 'Genkouryo_Payment', 'Funding', 'Production_Funding', 'Platform_TopUp', 'Task_Payment', 'Escrow_Refund'];

export const calculateMonthlyStats = (transactions: TransactionDto[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTxs = transactions.filter(tx => {
    const txDate = parseApiDate(tx.createAt ?? '');
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const genkouryoIncome = monthlyTxs
    .filter(tx => ['Genkouryo', 'Genkouryo_Payment'].includes(normalizeTransactionType(tx.type ?? '')) && Number(tx.amount ?? 0) > 0)
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount ?? 0)), 0);

  const taskPaymentIncome = monthlyTxs
    .filter(tx => normalizeTransactionType(tx.type ?? '') === 'Transfer' && Number(tx.amount ?? 0) < 0)
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount ?? 0)), 0);

  const totalIncome = monthlyTxs
    .filter(tx => INCOME_TYPES.includes(normalizeTransactionType(tx.type ?? '')))
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount ?? 0)), 0);

  const totalExpense = monthlyTxs
    .filter(tx => !INCOME_TYPES.includes(normalizeTransactionType(tx.type ?? '')))
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount ?? 0)), 0);

  return {
    genkouryoIncome,
    taskPaymentIncome,
    totalIncome,
    totalExpense,
    transactionCount: monthlyTxs.length,
  };
};
