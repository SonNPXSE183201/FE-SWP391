import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { seriesApi } from '../api/series.api';
import { isApiSuccess } from '../../../api/apiResponse';
import type { ApiResponse } from '../../../api/generated/types';
import type { SeriesStatus } from '../../../types/entities';

interface UseSeriesSubmitOptions {
  seriesId?: string;
  nameFile: File | null;
  onStatusChange: (status: SeriesStatus) => void;
}

export const useSeriesSubmit = ({ seriesId, nameFile, onStatusChange }: UseSeriesSubmitOptions) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForApproval = useCallback(async () => {
    if (!seriesId) {
      toast.error('Không xác định được series. Vui lòng tải lại trang.');
      return;
    }

    if (!nameFile) {
      toast.error('Vui lòng upload bản phác thảo (Name) trước khi submit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await seriesApi.submitReview(seriesId, {
        submissionNotes: `Bản phác thảo (Name): ${nameFile.name}`,
      });
      const apiData = res.data as ApiResponse<null>;

      if (!isApiSuccess(apiData)) {
        toast.error(apiData.message || 'Gửi xét duyệt thất bại');
        return;
      }

      onStatusChange('PendingApproval');
      await queryClient.invalidateQueries({ queryKey: ['series', seriesId] });
      await queryClient.invalidateQueries({ queryKey: ['series'] });
      toast.success('Đã gửi xét duyệt! Editor phụ trách sẽ nhận được thông báo.');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }, [seriesId, nameFile, onStatusChange, queryClient]);

  return {
    isSubmitting,
    submitForApproval,
  };
};
