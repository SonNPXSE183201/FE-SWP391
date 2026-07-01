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
  const [isDeclining, setIsDeclining] = useState(false);

  const invalidateSeries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['series', seriesId] }),
      queryClient.invalidateQueries({ queryKey: ['series'] }),
      queryClient.invalidateQueries({ queryKey: ['wallet'] }),
    ]);
  }, [queryClient, seriesId]);

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
      await invalidateSeries();
      toast.success(apiData.message || 'Đã chấp nhận vốn! Tiền đã được nạp vào Setup Fund.');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsAccepting(false);
    }
  }, [seriesId, onStatusChange, invalidateSeries]);

  const declineFund = useCallback(async () => {
    if (!seriesId) {
      toast.error('Không xác định được series. Vui lòng tải lại trang.');
      return;
    }

    if (!window.confirm('Từ chối vốn sẽ đưa series về bản nháp để thương lượng lại. Tiếp tục?')) {
      return;
    }

    setIsDeclining(true);
    try {
      const res = await seriesApi.declineFund(seriesId);
      const apiData = res.data as ApiResponse<null>;

      if (!isApiSuccess(apiData)) {
        toast.error(apiData.message || 'Từ chối vốn thất bại');
        return;
      }

      onStatusChange('Draft');
      await invalidateSeries();
      toast.success(apiData.message || 'Đã từ chối vốn. Series quay về bản nháp.');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsDeclining(false);
    }
  }, [seriesId, onStatusChange, invalidateSeries]);

  return {
    isAccepting,
    isDeclining,
    acceptFund,
    declineFund,
  };
};
