import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rankingApi } from '../api/rankingApi';

export const useRankingList = (params?: { period?: string; genre?: string }) => {
  return useQuery({
    queryKey: ['ranking', 'list', params],
    queryFn: () => rankingApi.fetchRanking(params),
    staleTime: 1000 * 60,
  });
};

export const useSubmitRankingVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ seriesId, action, comment }: { seriesId: string; action: 'maintain' | 'cancel'; comment?: string }) =>
      rankingApi.submitRankingVote({
        seriesId: Number(seriesId) || undefined,
        voteType: action === 'cancel' ? 'Cancel' : 'Maintain',
        comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranking', 'list'] });
    },
  });
};
