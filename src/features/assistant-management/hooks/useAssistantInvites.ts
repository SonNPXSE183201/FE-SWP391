import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/axios';

export interface AssistantInviteDto {
  seriesId: number;
  seriesTitle: string;
  coverUrl?: string;
  roleInTeam: string;
  status: string;
  createAt: string;

  // Series detail
  genre?: string;
  synopsis?: string;
  publicationSchedule?: string;
  seriesStatus?: string;

  // Mangaka info
  mangakaName?: string;
  mangakaPenName?: string;

  // Team info
  teamSize: number;
}

import { useAuthStore } from '../../../stores/authStore';

export const assistantInvitesKeys = {
  all: ['assistant-invites'] as const,
};

export const useAssistantInvites = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: assistantInvitesKeys.all,
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<AssistantInviteDto[]>>('/api/Assistants/me/invites');
      return res.data.data ?? [];
    },
    enabled: user?.role === 'Assistant',
    refetchInterval: user?.role === 'Assistant' ? 5_000 : false,
    refetchIntervalInBackground: false,
  });
};
