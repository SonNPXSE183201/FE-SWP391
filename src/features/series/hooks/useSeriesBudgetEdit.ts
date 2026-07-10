import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { seriesApi } from '../api/series.api';
import { isApiSuccess } from '../../../api/apiResponse';
import type { ApiResponse, SeriesDto } from '../../../api/generated/types';
import type { SeriesNameUpdateSnapshot } from '../api/series.api';

interface UseSeriesBudgetEditOptions {
  seriesId?: string;
  seriesSnapshot?: SeriesNameUpdateSnapshot;
  resourceFolderUrl?: string | null;
}

export const useSeriesBudgetEdit = ({
  seriesId,
  seriesSnapshot,
  resourceFolderUrl,
}: UseSeriesBudgetEditOptions) => {
  const queryClient = useQueryClient();

  const saveBudget = useCallback(
    async (amount: number) => {
      if (!seriesId || !seriesSnapshot) {
        throw new Error('Thiếu thông tin series.');
      }

      const res = await seriesApi.saveNameManuscript(
        seriesId,
        { ...seriesSnapshot, estimatedProductionBudget: amount },
        resourceFolderUrl ?? null,
      );
      const apiData = res.data as ApiResponse<SeriesDto>;

      if (!isApiSuccess(apiData)) {
        throw new Error(apiData.message || 'Cập nhật ngân sách thất bại');
      }

      await queryClient.invalidateQueries({ queryKey: ['series', seriesId] });
    },
    [seriesId, seriesSnapshot, resourceFolderUrl, queryClient],
  );

  return { saveBudget };
};
