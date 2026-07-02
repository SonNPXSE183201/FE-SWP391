import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/axios';
import type { AssistantBrowseItem } from '../types/assistantBrowse.types';
import { filterAssistants, isTopPickCandidate } from '../utils/assistantInvite.utils';

export const assistantBrowseKeys = {
  all: ['assistants', 'browse'] as const,
};

export const useBrowseAssistants = () =>
  useQuery({
    queryKey: assistantBrowseKeys.all,
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<{ items?: AssistantBrowseItem[] }>>('/api/Assistants', {
        params: { pageNumber: 1, pageSize: 100 },
      });
      return res.data.data?.items ?? [];
    },
    staleTime: 60_000,
  });

export const useFilteredAssistants = (
  assistants: AssistantBrowseItem[],
  search: string,
  selectedRole: string,
  memberByAssistantId: Map<number, { status: string }>,
) => {
  const filteredAssistants = useMemo(
    () => filterAssistants(assistants, search, selectedRole),
    [assistants, search, selectedRole],
  );

  const topPicks = useMemo(
    () =>
      filteredAssistants
        .filter((assistant) =>
          isTopPickCandidate(
            assistant,
            selectedRole,
            memberByAssistantId.get(assistant.id)?.status,
          ),
        )
        .slice(0, 3),
    [filteredAssistants, memberByAssistantId, selectedRole],
  );

  const topPickIds = useMemo(() => new Set(topPicks.map((a) => a.id)), [topPicks]);

  const restAssistants = useMemo(
    () => filteredAssistants.filter((assistant) => !topPickIds.has(assistant.id)),
    [filteredAssistants, topPickIds],
  );

  return { filteredAssistants, topPicks, restAssistants };
};
