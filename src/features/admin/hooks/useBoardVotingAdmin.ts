import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import {
  boardVotingAdminApi,
  type ManualResolveBoardVoteDto,
  type UpdateBoardVotingConfigDto,
} from '../api/boardVoting.api';

export const useBoardVotingConfig = () =>
  useQuery({
    queryKey: ['admin', 'board-voting', 'config'],
    queryFn: () => boardVotingAdminApi.getConfig(),
  });

export const useBoardVotingRules = () =>
  useQuery({
    queryKey: ['admin', 'board-voting', 'rules'],
    queryFn: () => boardVotingAdminApi.getRules(),
  });

/** Thành viên Hội đồng active — dùng chọn Chủ tịch HĐ */
export const useBoardMembers = () =>
  useQuery({
    queryKey: ['admin', 'board-members'],
    queryFn: async () => {
      const response = await adminApi.getUsers({
        role: 'Board',
        status: 'Active',
        page: 1,
        pageSize: 50,
      });
      return response.data.data?.items ?? [];
    },
    staleTime: 60_000,
  });

export const useEscalatedVotes = () =>
  useQuery({
    queryKey: ['admin', 'board-voting', 'escalated'],
    queryFn: () => boardVotingAdminApi.getEscalated(),
    refetchInterval: 30_000,
  });

export const useUpdateBoardVotingConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateBoardVotingConfigDto) => boardVotingAdminApi.updateConfig(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'board-voting'] });
      qc.invalidateQueries({ queryKey: ['voting'] });
    },
  });
};

export const useManualResolveVote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ seriesId, dto }: { seriesId: string; dto: ManualResolveBoardVoteDto }) =>
      boardVotingAdminApi.manualResolve(seriesId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'board-voting'] });
      qc.invalidateQueries({ queryKey: ['voting'] });
      qc.invalidateQueries({ queryKey: ['series'] });
    },
  });
};
