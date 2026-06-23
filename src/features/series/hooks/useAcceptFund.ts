import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { seriesApi } from '../api/series.api';
import { isApiSuccess } from '../../../api/apiResponse';
import type { ApiResponse } from '../../../api/generated/types';
import type { SeriesStatus } from '../../../types/entities';

interface UseAcceptFundOptions {
  seriesId?: string;
  onStatusChange: (status: SeriesStatus) => void;
}

export const useAcceptFund = ({ seriesId, onStatusChange }: UseAcceptFundOptions) => {
  const queryClient = useQueryClient();
  const [isAccepting, setIsAccepting] = useState(false);

  const acceptFund = useCallback(async () => {
    if (!seriesId) {
      toast.error('Không xác định được series. Vui lòng tải lại trang.');
      return;
    }

    setIsAccepting(true);
    try {
      const res = await seriesApi.acceptFund(seriesId);
      const apiData = res.data as ApiResponse<null>;

      if (!isApiSuccess(apiData)) {
        toast.error(apiData.message || 'Chấp nhận vốn thất bại');
        return;
      }

      onStatusChange('Published');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['series', seriesId] }),
        queryClient.invalidateQueries({ queryKey: ['series'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet'] }),
      ]);
      toast.success(apiData.message || 'Đã chấp nhận vốn! Tiền đã được nạp vào Setup Fund.');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsAccepting(false);
    }
  }, [seriesId, onStatusChange, queryClient]);

  return {
    isAccepting,
    acceptFund,
  };
};
