import type { Transaction } from '../../types/entities';

// Transaction types that count as income
const INCOME_TYPES = ['Deposit', 'Unlock', 'Genkouryo', 'Funding'];

export const calculateMonthlyStats = (transactions: Transaction[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTxs = transactions.filter(tx => {
    const txDate = new Date(tx.createdAt);
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
