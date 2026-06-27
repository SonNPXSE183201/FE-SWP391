import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/generated/types';

export interface PlatformWalletDto {
  balance: number;
  treasuryWalletId: number;
  label: string;
  description: string;
}

export interface TopUpPlatformWalletDto {
  amount: number;
  note?: string;
}

export const platformWalletApi = {
  getTreasury: async (): Promise<PlatformWalletDto> => {
    const res = await axiosInstance.get<ApiResponse<PlatformWalletDto>>('/api/admin/platform-wallet');
    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.message || 'Không tải được ví quỹ hệ thống');
    }
    return res.data.data;
  },

  topUp: async (payload: TopUpPlatformWalletDto): Promise<string> => {
    const res = await axiosInstance.post<ApiResponse<string>>(
      '/api/admin/platform-wallet/top-up',
      payload,
    );
    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.message || 'Khởi tạo nạp quỹ thất bại');
    }
    return res.data.data;
  },
};
