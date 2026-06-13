import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractApi } from '../api/contract.api';

const KEYS = {
  approvedSeries: ['contracts', 'series', 'approved'] as const,
};

export const useApprovedSeries = () =>
  useQuery({
    queryKey: KEYS.approvedSeries,
    queryFn: () => contractApi.getApprovedSeries(),
    select: (res) => res.data?.Data ?? [],
  });

export const useCreateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ seriesId, baseGenkouryoPrice }: { seriesId: string; baseGenkouryoPrice: number }) =>
      contractApi.createContract(seriesId, baseGenkouryoPrice),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.approvedSeries }),
  });
};
