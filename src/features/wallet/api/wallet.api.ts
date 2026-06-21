import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  WalletDetailsDto,
  DepositRequestDto,
  WithdrawRequestDto,
} from '../../../api/generated/types';

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
      amount: data.amount,
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
      amount: data.amount,
      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber,
      bankAccountName: data.bankAccountName,
    };
    return axiosInstance.post<ApiResponse<unknown>>('/api/wallets/withdraw', payload);
  },
};
