import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { seriesApi } from '../api/series.api';
import { isApiSuccess } from '../../../api/apiResponse';
import type { ApiResponse } from '../../../api/generated/types';
import type { SeriesStatus } from '../../../types/status.types';

interface UseAcceptFundOptions {
  seriesId?: string;
  onStatusChange: (status: SeriesStatus) => void;
}

export const useAcceptFund = ({ seriesId, onStatusChange }: UseAcceptFundOptions) => {
  const queryClient = useQueryClient();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const invalidateSeries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['series', seriesId] }),
      queryClient.invalidateQueries({ queryKey: ['series'] }),
      queryClient.invalidateQueries({ queryKey: ['contracts'] }),
      queryClient.invalidateQueries({ queryKey: ['wallet'] }),
    ]);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['series', seriesId], type: 'active' }),
      queryClient.refetchQueries({ queryKey: ['series'], type: 'active' }),
      queryClient.refetchQueries({ queryKey: ['contracts'], type: 'active' }),
      queryClient.refetchQueries({ queryKey: ['wallet'], type: 'active' }),
    ]);
  }, [queryClient, seriesId]);

  const acceptFund = useCallback(async () => {
    if (!seriesId) {
      toast.error('Không xác định được bộ truyện. Vui lòng tải lại trang.');
      return;
    }

    setIsAccepting(true);
    try {
      const res = await seriesApi.acceptFund(seriesId);
      const apiData = res.data as ApiResponse<null>;

      if (!isApiSuccess(apiData)) {
        toast.error(apiData.message || 'Xác nhận mức vốn thất bại.');
        return;
      }

      onStatusChange('Fund_Pending');
      await invalidateSeries();
      toast.success(apiData.message || 'Đã xác nhận mức vốn. Admin sẽ lập hợp đồng cho bộ truyện.');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsAccepting(false);
    }
  }, [seriesId, onStatusChange, invalidateSeries]);

  const signContract = useCallback(async () => {
    if (!seriesId) {
      toast.error('Không xác định được bộ truyện. Vui lòng tải lại trang.');
      return;
    }

    setIsSigning(true);
    try {
      const res = await seriesApi.signContract(seriesId);
      const apiData = res.data as ApiResponse<null>;

      if (!isApiSuccess(apiData)) {
        toast.error(apiData.message || 'Ký hợp đồng thất bại.');
        return;
      }

      onStatusChange('In Production');
      await invalidateSeries();
      toast.success(apiData.message || 'Đã ký hợp đồng. Vốn đã được nạp vào quỹ thiết lập.');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSigning(false);
    }
  }, [seriesId, onStatusChange, invalidateSeries]);

  const declineFund = useCallback(async () => {
    if (!seriesId) {
      toast.error('Không xác định được bộ truyện. Vui lòng tải lại trang.');
      return;
    }

    setIsDeclining(true);
    try {
      const res = await seriesApi.declineFund(seriesId);
      const apiData = res.data as ApiResponse<null>;

      if (!isApiSuccess(apiData)) {
        toast.error(apiData.message || 'Từ chối vốn thất bại.');
        return;
      }

      onStatusChange('Draft');
      await invalidateSeries();
      toast.success(apiData.message || 'Đã từ chối vốn. Bộ truyện quay về bản nháp.');
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
    isSigning,
    acceptFund,
    declineFund,
    signContract,
  };
};
