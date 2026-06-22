import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reconciliationApi } from '../api/reconciliation.api';
import { getAxiosErrorMessage } from '../../../api/apiResponse';
import type { ReconciliationReportDto } from '../../../api/generated/types';

export const useImportReconciliationCsv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => reconciliationApi.importCsv(file),
    onSuccess: (report: ReconciliationReportDto) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      toast.success(
        `Đối soát xong: ${report.matchedCount ?? 0} khớp, ${report.unresolvedCount ?? 0} chưa xử lý`,
      );
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, 'Không thể import file đối soát'));
    },
  });
};
