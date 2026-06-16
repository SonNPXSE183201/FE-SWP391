import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '../api/schedule.api';

const KEYS = {
  schedule: ['publishing', 'schedule'] as const,
};

export const useSchedule = () =>
  useQuery({
    queryKey: KEYS.schedule,
    queryFn: () => scheduleApi.getSchedule(),
    select: (res) => res.data?.Data ?? [],
  });

export const useReschedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publishDate }: { id: string; publishDate: string }) =>
      scheduleApi.reschedule(id, publishDate),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.schedule }),
  });
};

export const useMarkPublished = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleApi.markPublished(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.schedule }),
  });
};
