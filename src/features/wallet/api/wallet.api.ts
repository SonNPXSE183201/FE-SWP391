import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/axios';
import { components } from '../../../api/generated/schema';

export type WalletDetailsDto = components["schemas"]["WalletDetailsDto"];
export type DepositRequestDto = components["schemas"]["DepositRequestDto"];
export type WithdrawRequestDto = components["schemas"]["WithdrawRequestDto"];

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
  getMyWallet: async () => {
    return axiosInstance.get<ApiResponse<WalletDetailsDto>>('/api/wallets/me');
  },

  deposit: async (data: DepositRequest) => {
    const payload: DepositRequestDto = {
      Amount: data.amount,
    };
    return axiosInstance.post<ApiResponse<string>>('/api/wallets/deposit', payload);
  },

  confirmDeposit: async (queryParams: Record<string, string>) => {
    return axiosInstance.get<ApiResponse<boolean>>('/api/wallets/deposit/return', {
      params: queryParams,
    });
  },

  withdraw: async (data: WithdrawRequest) => {
    const payload: WithdrawRequestDto = {
      Amount: data.amount,
      BankName: data.bankName,
      BankAccountNumber: data.bankAccountNumber,
      BankAccountName: data.bankAccountName,
    };
    return axiosInstance.post<ApiResponse<any>>('/api/wallets/withdraw', payload);
  },
};
