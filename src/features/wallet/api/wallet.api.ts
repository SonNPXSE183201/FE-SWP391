import { axiosInstance } from '../../api/axios';
import type { ApiResponse, Wallet, Transaction, PaginatedResponse } from '../../types';

// ─── Request DTOs ────────────────────────────────────────────

export interface DepositRequest {
  amount: number;
  returnUrl: string;   // VNPay redirect URL
}

export interface WithdrawRequest {
  amount: number;
  bankAccount: string;
  bankName: string;
}

export interface DepositResponse {
  paymentUrl: string;  // VNPay payment URL to redirect user
}

// ─── API Functions ───────────────────────────────────────────

export const walletApi = {
  // Get wallet info
  getMyWallet: () =>
    axiosInstance.get<ApiResponse<Wallet>>('/api/wallet'),

  // Transaction history
  getTransactions: (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    from?: string;
    to?: string;
  }) =>
    axiosInstance.get<PaginatedResponse<Transaction>>('/api/wallet/transactions', { params }),

  // Deposit via VNPay (F1.9)
  deposit: (data: DepositRequest) =>
    axiosInstance.post<ApiResponse<DepositResponse>>('/api/wallet/deposit', data),

  // Withdraw (F1.8)
  withdraw: (data: WithdrawRequest) =>
    axiosInstance.post<ApiResponse<null>>('/api/wallet/withdraw', data),
};
