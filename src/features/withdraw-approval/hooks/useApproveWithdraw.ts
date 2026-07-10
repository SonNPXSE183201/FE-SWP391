import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { withdrawApprovalApi } from '../api/withdrawApproval.api';
import { getApiMessage, getAxiosErrorMessage, isApiSuccess } from '../../../api/apiResponse';
import type { ApproveWithdrawPayload } from '../types/withdrawApproval.types';
import { pendingWithdrawalsKey } from './usePendingWithdrawals';

export const useApproveWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, isApproved, adminNote }: ApproveWithdrawPayload) => {
      const response = await withdrawApprovalApi.approve(transactionId, {
        isApproved,
        adminNote: adminNote || null,
      });
      const payload = response.data;
      if (!isApiSuccess(payload)) {
        throw new Error(getApiMessage(payload, 'Xử lý yêu cầu rút tiền thất bại'));
      }
      return payload;
    },
    onSuccess: (payload, variables) => {
      queryClient.invalidateQueries({ queryKey: pendingWithdrawalsKey });
      toast.success(
        payload.message
          || (variables.isApproved
            ? 'Đã phê duyệt yêu cầu rút tiền'
            : 'Đã từ chối yêu cầu rút tiền'),
      );
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, 'Có lỗi xảy ra khi xử lý yêu cầu rút tiền'));
    },
  });
};
