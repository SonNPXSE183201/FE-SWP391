import { useQuery } from '@tanstack/react-query';
import { reconciliationApi } from '../api/reconciliation.api';
import type { ReconciliationParams } from '../types/reconciliation.types';

// ─── Hook ────────────────────────────────────────────────────

export const useReconciliation = (params?: ReconciliationParams) => {
  return useQuery({
    queryKey: ['reconciliation', params],
    queryFn: () => reconciliationApi.fetchReconciliation(params),
    staleTime: 1000 * 60 * 2,
  });
};
