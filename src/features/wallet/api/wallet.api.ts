import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  WalletDetailsDto,
  DepositRequestDto,
  WithdrawRequestDto,
} from '../../../api/generated/types';

export type { DepositRequestDto, WithdrawRequestDto };

export const walletApi = {
  getMyWallet: async () => {
    return axiosInstance.get<ApiResponse<WalletDetailsDto>>('/api/wallets/me');
  },

  deposit: async (data: DepositRequestDto) => {
    return axiosInstance.post<ApiResponse<string>>('/api/wallets/deposit', data);
  },

  confirmDeposit: async (queryParams: Record<string, string>) => {
    return axiosInstance.get<ApiResponse<boolean>>('/api/wallets/deposit/return', {
      params: queryParams,
    });
  },

  withdraw: async (data: WithdrawRequestDto) => {
    return axiosInstance.post<ApiResponse<unknown>>('/api/wallets/withdraw', data);
  },
};
