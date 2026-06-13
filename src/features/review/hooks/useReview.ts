import { useQuery, useMutation } from '@tanstack/react-query';
import { reviewApi } from '../api/review.api';

const KEYS = {
  reviewSeriesDetail: (seriesId: string) => ['review', 'series', seriesId] as const,
};

export const useReviewSeriesDetail = (seriesId: string) =>
  useQuery({
    queryKey: KEYS.reviewSeriesDetail(seriesId),
    queryFn: () => reviewApi.getReviewSeriesDetail(seriesId),
    select: (res) => res.data?.Data ?? null,
    enabled: !!seriesId,
  });

export const useSubmitToBoard = () =>
  useMutation({
    mutationFn: ({ seriesId, notes }: { seriesId: string; notes: string }) =>
      reviewApi.submitToBoard(seriesId, notes),
  });

export const useRequireRevision = () =>
  useMutation({
    mutationFn: ({ seriesId, reason }: { seriesId: string; reason: string }) =>
      reviewApi.requireRevision(seriesId, reason),
  });
