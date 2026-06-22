import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalApi } from '../api/approval.api';

const KEYS = {
  pendingProposals: ['approvals', 'proposals', 'pending'] as const,
};

export const usePendingProposals = () =>
  useQuery({
    queryKey: KEYS.pendingProposals,
    queryFn: () => approvalApi.getPendingProposals(),
    select: (res) => res.data?.data ?? [],
  });

export const useApproveProposal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ seriesId, payload }: { seriesId: string; payload: { approvedBudget: number; publishSchedule: string } }) =>
      approvalApi.approveProposal(seriesId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.pendingProposals }),
  });
};

export const useRejectProposal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (seriesId: string) => approvalApi.rejectProposal(seriesId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.pendingProposals }),
  });
};
