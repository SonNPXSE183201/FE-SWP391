import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';

const KEYS = {
  assistantProfile: ['profile', 'assistant'] as const,
};

export const useAssistantProfile = () =>
  useQuery({
    queryKey: KEYS.assistantProfile,
    queryFn: () => profileApi.getAssistantProfile(),
    select: (res) => res.data?.Data ?? null,
  });

export const useUpdateAssistantProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { portfolioUrl: string; skills: string[] }) =>
      profileApi.updateAssistantProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.assistantProfile }),
  });
};
