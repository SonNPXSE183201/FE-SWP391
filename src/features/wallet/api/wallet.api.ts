import { axiosInstance, type ApiResponse } from '../../../api/axios';
import type { Wallet, Transaction, PaginatedResponse } from '../../../types';

export interface WalletDetailsResponse {
  wallet: Wallet;
  transactions: Transaction[];
}

export interface DepositRequest {
  amount: number;
}

export interface WithdrawRequest {
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export const walletApi = {
  getMyWallet: () =>
    axiosInstance.get<ApiResponse<WalletDetailsResponse>>('/api/wallets/me'),

  getTransactions: (params?: { page?: number; pageSize?: number }) =>
    // Assuming backend might still have /api/wallet/transactions or similar, but WalletsController doesn't show it.
    // The me endpoint returns both. I will keep this signature just in case it's used somewhere, but point it to the correct route if it existed.
    // Actually, WalletsController doesn't have `getTransactions` endpoint. `GetMyWalletDetails` returns both.
    // I'll comment it out or leave it throwing an error if not implemented.
    Promise.reject(new Error("Use getMyWallet instead to get transactions.")),

  deposit: (data: DepositRequest) =>
    axiosInstance.post<ApiResponse<string>>('/api/wallets/deposit', data),

  confirmDeposit: (referenceCode: string, status: string) =>
    axiosInstance.get<ApiResponse<boolean>>('/api/wallets/deposit/callback', { params: { referenceCode, status } }),

  withdraw: (data: WithdrawRequest) =>
    axiosInstance.post<ApiResponse<Transaction>>('/api/wallets/withdraw', data),
};
