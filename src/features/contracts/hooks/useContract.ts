import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractApi } from '../api/contract.api';

const KEYS = {
  approvedSeries: ['contracts', 'series', 'approved'] as const,
};

export const useApprovedSeries = () =>
  useQuery({
    queryKey: KEYS.approvedSeries,
    queryFn: () => contractApi.getApprovedSeries(),
  });

export const useCreateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ seriesId, baseGenkouryoPrice }: { seriesId: string; baseGenkouryoPrice: number }) =>
      contractApi.createContract(seriesId, baseGenkouryoPrice),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.approvedSeries }),
  });
};

export const useUpdateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { contractId: string; genkouryoPrice?: number; endDate?: string }) =>
      contractApi.updateContract({
        contractId: payload.contractId,
        genkouryoPrice: payload.genkouryoPrice,
        endDate: payload.endDate,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.approvedSeries }),
  });
};
