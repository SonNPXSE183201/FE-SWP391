import { useQuery } from '@tanstack/react-query';
import { withdrawApprovalApi } from '../api/withdrawApproval.api';
import { getApiData, getApiMessage, isApiSuccess } from '../../../api/apiResponse';
import type { PendingWithdrawal } from '../types/withdrawApproval.types';

export const pendingWithdrawalsKey = ['admin', 'withdraw-pending'] as const;

export const usePendingWithdrawals = () => {
  return useQuery({
    queryKey: pendingWithdrawalsKey,
    queryFn: async (): Promise<PendingWithdrawal[]> => {
      const response = await withdrawApprovalApi.getPending();
      const payload = response.data;
      if (!isApiSuccess(payload)) {
        throw new Error(getApiMessage(payload, 'Không thể tải danh sách yêu cầu rút tiền'));
      }
      return getApiData(payload) ?? [];
    },
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
};
