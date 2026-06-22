import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeApi } from '../api/dispute.api';

const KEYS = {
  disputes: ['disputes'] as const,
  disputeDetail: (id: number | string) => ['disputes', id] as const,
};

export const useDisputes = () =>
  useQuery({
    queryKey: KEYS.disputes,
    queryFn: () => disputeApi.getDisputes(),
    select: (res) => res.data?.data ?? [],
  });

export const useDisputeDetail = (disputeId: number | string) =>
  useQuery({
    queryKey: KEYS.disputeDetail(disputeId),
    queryFn: () => disputeApi.getDisputeDetail(disputeId),
    select: (res) => res.data?.data ?? null,
    enabled: !!disputeId,
  });

export const useResolveDispute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ disputeId, payload }: { disputeId: number | string; payload: { assistantPaymentPercent: number; editorNote: string } }) =>
      disputeApi.resolveDispute(disputeId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.disputes });
    },
  });
};
