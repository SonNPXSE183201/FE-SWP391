import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  ApproveWithdrawRequestDto,
  TransactionDto,
} from '../../../api/generated/types';

export const withdrawApprovalApi = {
  getPending: async () => {
    return axiosInstance.get<ApiResponse<TransactionDto[]>>('/api/wallets/withdraw/pending');
  },

  approve: async (transactionId: number, body: ApproveWithdrawRequestDto) => {
    return axiosInstance.post<ApiResponse<TransactionDto>>(
      `/api/wallets/withdraw/${transactionId}/approve`,
      body,
    );
  },
};
