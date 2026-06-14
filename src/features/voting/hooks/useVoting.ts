import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { votingApi, type VotingStatus, type SubmitVotePayload } from '../api/voting.api';

export const useVotingList = (filter?: VotingStatus | 'All') => {
  return useQuery({
    queryKey: ['voting', 'list', filter],
    queryFn: () => votingApi.fetchVotingList(filter),
    staleTime: 1000 * 60,
  });
};

export const useVotingDetail = (votingId: string | null) => {
  return useQuery({
    queryKey: ['voting', 'detail', votingId],
    queryFn: () => votingApi.fetchVotingDetail(votingId!),
    enabled: !!votingId,
    staleTime: 1000 * 30,
  });
};

export const useSubmitBoardVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitVotePayload) => votingApi.submitVote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voting'] });
    },
  });
};
