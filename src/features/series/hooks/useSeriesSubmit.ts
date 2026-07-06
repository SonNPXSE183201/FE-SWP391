import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { seriesApi } from '../api/series.api';
import { isApiSuccess } from '../../../api/apiResponse';
import type { ApiResponse } from '../../../api/generated/types';
import type { SeriesStatus } from '../../../types/status.types';

interface UseSeriesSubmitOptions {
  seriesId?: string;
  hasNameManuscript: boolean;
  nameFileName?: string;
  onStatusChange: (status: SeriesStatus) => void;
}

export const useSeriesSubmit = ({
  seriesId,
  hasNameManuscript,
  nameFileName,
  onStatusChange,
}: UseSeriesSubmitOptions) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForApproval = useCallback(async (mangakaNote?: string) => {
    if (!seriesId) {
      toast.error('Không xác định được series. Vui lòng tải lại trang.');
      return;
    }

    if (!hasNameManuscript) {
      toast.error('Vui lòng upload bản phác thảo (Name) trước khi submit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const noteSuffix = nameFileName ? ` (File: ${nameFileName})` : '';
      const trimmedNote = mangakaNote?.trim();
      const submissionNotes = trimmedNote
        ? `${trimmedNote}${noteSuffix}`
        : `Bản phác thảo (Name) đã được nộp.${noteSuffix ? ` File: ${nameFileName}.` : ''}`;

      const res = await seriesApi.submitReview(seriesId, {
        submissionNotes,
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
  }, [seriesId, hasNameManuscript, nameFileName, onStatusChange, queryClient]);

  return {
    isSubmitting,
    submitForApproval,
  };
};
