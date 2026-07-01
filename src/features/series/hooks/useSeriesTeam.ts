import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seriesTeamApi } from '../api/seriesTeam.api';

export const seriesTeamKeys = {
  team: (seriesId?: string) => ['series', seriesId, 'team'] as const,
  activeTeam: (seriesId?: string) => ['series', seriesId, 'team', 'active'] as const,
};

export const useSeriesTeam = (seriesId?: string) =>
  useQuery({
    queryKey: seriesTeamKeys.team(seriesId),
    queryFn: async () => {
      const res = await seriesTeamApi.getTeam(seriesId!);
      return res.data.data ?? [];
    },
    enabled: !!seriesId,
  });

export const useSeriesActiveTeam = (seriesId?: string) =>
  useQuery({
    queryKey: seriesTeamKeys.activeTeam(seriesId),
    queryFn: async () => {
      const res = await seriesTeamApi.getActiveTeam(seriesId!);
      return res.data.data ?? [];
    },
    enabled: !!seriesId,
  });

export const useInviteSeriesAssistant = (seriesId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { assistantId: number; roleInTeam: string }) =>
      seriesTeamApi.invite(seriesId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesTeamKeys.team(seriesId) });
      queryClient.invalidateQueries({ queryKey: seriesTeamKeys.activeTeam(seriesId) });
    },
  });
};

export const useRemoveSeriesTeamMember = (seriesId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assistantId: number) => seriesTeamApi.removeMember(seriesId!, assistantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesTeamKeys.team(seriesId) });
      queryClient.invalidateQueries({ queryKey: seriesTeamKeys.activeTeam(seriesId) });
    },
  });
};

export const useRespondSeriesInvite = (seriesId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accept: boolean) => seriesTeamApi.respond(seriesId!, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesTeamKeys.team(seriesId) });
    },
  });
};
