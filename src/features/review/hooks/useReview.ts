import { useQuery, useMutation } from '@tanstack/react-query';
import { reviewApi } from '../api/review.api';
import type { ApproveChapterPayload } from '../types';

const KEYS = {
  reviewSeriesDetail: (seriesId: string) => ['review', 'series', seriesId] as const,
  reviewQueue: ['review', 'queue'] as const,
  chapterReview: (chapterId: string) => ['review', 'chapter', chapterId] as const,
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

// ─── Chapter QC Review hooks ─────────────────────────────────
export const useReviewQueue = () =>
  useQuery({
    queryKey: KEYS.reviewQueue,
    queryFn: () => reviewApi.getReviewQueue(),
    select: (res) => res.data?.Data ?? [],
  });

export const useChapterReview = (chapterId: string) =>
  useQuery({
    queryKey: KEYS.chapterReview(chapterId),
    queryFn: () => reviewApi.getChapterReview(chapterId),
    select: (res) => res.data?.Data ?? null,
    enabled: !!chapterId,
  });

export const useApproveChapter = () =>
  useMutation({
    mutationFn: (payload: ApproveChapterPayload) => reviewApi.approveChapter(payload),
  });

export const useRequireChapterRevision = () =>
  useMutation({
    mutationFn: ({ chapterId, reason }: { chapterId: string; reason: string }) =>
      reviewApi.requireChapterRevision(chapterId, reason),
  });
