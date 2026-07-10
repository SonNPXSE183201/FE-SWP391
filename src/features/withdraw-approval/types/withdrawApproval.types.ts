import type { TransactionDto } from '../../../api/generated/types';

export type PendingWithdrawal = TransactionDto;

export interface ApproveWithdrawPayload {
  transactionId: number;
  isApproved: boolean;
  adminNote?: string;
}
