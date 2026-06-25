import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { votingApi, type VotingListFilter, type VoteSeriesRequestDto } from '../api/voting.api';
import { useAuthStore } from '../../../stores/authStore';

export const useVotingList = (filter?: VotingListFilter) => {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['voting', 'list', filter, userId],
    queryFn: () => votingApi.fetchVotingList(filter, userId),
    staleTime: 1000 * 60,
  });
};

export const useVotingDetail = (votingId: string | null) => {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['voting', 'detail', votingId, userId],
    queryFn: () => votingApi.fetchVotingDetail(votingId!, userId),
    enabled: !!votingId,
    staleTime: 1000 * 30,
  });
};

export const useSubmitBoardVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ seriesId, body }: { seriesId: string; body: VoteSeriesRequestDto }) =>
      votingApi.submitVote(seriesId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voting'] });
    },
  });
};
