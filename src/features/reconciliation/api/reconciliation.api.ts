import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, ReconciliationReportDto, ReconciliationResponseDto } from '../../../api/generated/types';
import type {
  ReconciliationRecord,
  ReconciliationSummary,
  ReconciliationParams,
} from '../types/reconciliation.types';

const calculateSummary = (records: ReconciliationRecord[]): ReconciliationSummary => ({
  totalRecords: records.length,
  matchedCount: records.filter((r) => r.status === 'Matched').length,
  mismatchCount: records.filter((r) => r.status === 'Mismatch').length,
  missingCount: records.filter((r) => r.status === 'Missing').length,
  pendingCount: records.filter((r) => r.status === 'Pending').length,
  totalVnpayAmount: records.reduce((sum, r) => sum + (r.vnpayAmount ?? 0), 0),
  totalInternalAmount: records.reduce((sum, r) => sum + (r.internalAmount ?? 0), 0),
  differenceAmount: Math.abs(
    records.reduce((sum, r) => sum + (r.vnpayAmount ?? 0), 0) -
      records.reduce((sum, r) => sum + (r.internalAmount ?? 0), 0),
  ),
});

export const reconciliationApi = {
  fetchReconciliation: async (params?: ReconciliationParams): Promise<ReconciliationResponseDto> => {
    const res = await axiosInstance.get<ApiResponse<ReconciliationResponseDto>>(
      '/api/admin/reconciliation',
      { params },
    );
    return res.data?.data ?? { records: [], summary: calculateSummary([]) };
  },

  importCsv: async (file: File): Promise<ReconciliationReportDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post<ApiResponse<ReconciliationReportDto>>(
      '/api/admin/reconciliation/import-csv',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    if (!res.data?.success || !res.data.data) {
      throw new Error(res.data?.message || 'Import file đối soát thất bại');
    }
    return res.data.data;
  },
};
