import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { SeriesStatus } from '../../../types/entities';

interface UseSeriesSubmitOptions {
  nameFile: File | null;
  onStatusChange: (status: SeriesStatus) => void;
}

export const useSeriesSubmit = ({ nameFile, onStatusChange }: UseSeriesSubmitOptions) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForApproval = useCallback(async () => {
    if (!nameFile) {
      toast.error('Vui lòng upload bản phác thảo (Name) trước khi submit.');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Replace with real API call
      // await seriesApi.submit(seriesId, { nameFile });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onStatusChange('PendingApproval');
      toast.success('Đã gửi xét duyệt! Editor sẽ nhận được thông báo.');
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }, [nameFile, onStatusChange]);

  return {
    isSubmitting,
    submitForApproval,
  };
};
