import type { Transaction } from '../../types/entities';
import { TX_TYPE_CONFIG } from './constants';
import type { TransactionType } from '../../types/entities';
import { parseApiDate } from '../../utils/parseApiDate';

export { parseApiDate };

export const normalizeTransactionType = (type: string): TransactionType => {
  if (type === 'Withdrawal') return 'Withdraw';
  return type as TransactionType;
};

export const formatTransactionDateTime = (iso: string) =>
  parseApiDate(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  });

export const getTransactionAmountDisplay = (tx: Transaction) => {
  const txType = normalizeTransactionType(String(tx.type));
  const cfg = TX_TYPE_CONFIG[txType] ?? TX_TYPE_CONFIG[String(tx.type) as TransactionType];

  let sign = cfg?.sign;
  if (!sign) {
    if (tx.withdrawableAmount < 0 || tx.setupFundAmount < 0) sign = '-';
    else if (tx.withdrawableAmount > 0 || tx.setupFundAmount > 0) sign = '+';
    else sign = tx.amount >= 0 ? '+' : '-';
  }

  const isDebit = sign === '-';
  const value = Math.abs(tx.amount) || Math.abs(tx.withdrawableAmount) || Math.abs(tx.setupFundAmount);

  return {
    sign,
    isDebit,
    value,
    colorClass: isDebit ? 'text-danger' : 'text-success',
    label: cfg?.label ?? String(tx.type),
  };
};

// Transaction types that count as income
const INCOME_TYPES = ['Deposit', 'Unlock', 'Genkouryo', 'Funding', 'Production_Funding', 'Platform_TopUp'];

export const calculateMonthlyStats = (transactions: Transaction[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTxs = transactions.filter(tx => {
    const txDate = parseApiDate(tx.createdAt);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const genkouryoIncome = monthlyTxs
    .filter(tx => tx.type === 'Genkouryo' && tx.amount > 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const taskPaymentIncome = monthlyTxs
    .filter(tx => tx.type === 'Transfer' && tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalIncome = monthlyTxs
    .filter(tx => INCOME_TYPES.includes(tx.type))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalExpense = monthlyTxs
    .filter(tx => !INCOME_TYPES.includes(tx.type))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return {
    genkouryoIncome,
    taskPaymentIncome,
    totalIncome,
    totalExpense,
    transactionCount: monthlyTxs.length,
  };
};
