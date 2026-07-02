import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  votingApi,
  type VotingListFilter,
  type VotingListResult,
  type VoteSeriesRequestDto,
} from '../api/voting.api';
import { useAuthStore } from '../../../stores/authStore';
import type { VotingSeriesDto } from '../voting.utils';

const votingListKey = (userId?: number | string | null) => ['voting', 'list', userId] as const;

export const useVotingList = () => {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: votingListKey(userId),
    queryFn: () => votingApi.fetchVotingList('All', userId),
    staleTime: 1000 * 30,
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

const patchSeriesVoteInList = (
  result: VotingListResult,
  seriesId: string,
  boardMemberId: number,
  body: VoteSeriesRequestDto & { voteChoice?: string },
): VotingListResult => ({
  ...result,
  series: result.series.map((series) => {
    if (String(series.id) !== seriesId) return series;
    const voteType =
      body.voteChoice ?? (body.approved ? 'Approve' : 'Reject');
    const optimisticVote = {
      seriesId: Number(seriesId),
      boardMemberId,
      voteType,
      recommendedBudget: body.recommendedBudget ?? 0,
      comment: body.comment ?? null,
      voteAt: new Date().toISOString(),
    };
    const existing = series.boardVotes ?? [];
    const withoutMine = existing.filter((v) => Number(v.boardMemberId) !== boardMemberId);
    return {
      ...series,
      boardVotes: [...withoutMine, optimisticVote],
    } satisfies VotingSeriesDto;
  }),
});

export const useSubmitBoardVote = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({
      seriesId,
      body,
    }: {
      seriesId: string;
      body: VoteSeriesRequestDto & { voteChoice?: string };
    }) => votingApi.submitVote(seriesId, body),
    onMutate: async ({ seriesId, body }) => {
      const memberId = Number(userId);
      if (!Number.isFinite(memberId)) return undefined;

      const key = votingListKey(userId);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<VotingListResult>(key);
      if (previous) {
        queryClient.setQueryData(
          key,
          patchSeriesVoteInList(previous, seriesId, memberId, body),
        );
      }

      return { previous, key };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['voting'] });
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
};

export type { VotingListFilter };
