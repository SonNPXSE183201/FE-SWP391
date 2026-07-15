import { useQuery, useMutation } from '@tanstack/react-query';
import { reviewApi } from '../api/review.api';
import type { ApproveChapterPayload } from '../types';

const KEYS = {
  reviewSeriesDetail: (seriesId: string) => ['review', 'series', seriesId] as const,
  pendingSeries: ['review', 'series', 'pending'] as const,
  reviewQueue: ['review', 'queue'] as const,
  chapterReview: (chapterId: string) => ['review', 'chapter', chapterId] as const,
};

export const usePendingSeriesReview = () =>
  useQuery({
    queryKey: KEYS.pendingSeries,
    queryFn: () => reviewApi.getPendingSeries(),
    select: (res) => res.data?.data ?? [],
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
  });

export const useReviewSeriesDetail = (seriesId: string) =>
  useQuery({
    queryKey: KEYS.reviewSeriesDetail(seriesId),
    queryFn: () => reviewApi.getReviewSeriesDetail(seriesId),
    select: (res) => res.data?.data ?? null,
    enabled: !!seriesId,
  });

export const useSubmitToBoard = () =>
  useMutation({
    mutationFn: ({
      seriesId,
      notes,
      editorRecommendedBudget,
    }: {
      seriesId: string;
      notes: string;
      editorRecommendedBudget?: number;
    }) => reviewApi.submitToBoard(seriesId, { notes, editorRecommendedBudget }),
  });

export const useRequireRevision = () =>
  useMutation({
    mutationFn: ({
      seriesId,
      comment,
      suggestedBudget,
      failedChecklistItems,
    }: {
      seriesId: string;
      comment: string;
      suggestedBudget?: number;
      failedChecklistItems?: string[];
    }) => reviewApi.requireRevision(seriesId, { comment, suggestedBudget, failedChecklistItems }),
  });

// ─── Chapter QC Review hooks ─────────────────────────────────
export const useReviewQueue = () =>
  useQuery({
    queryKey: KEYS.reviewQueue,
    queryFn: () => reviewApi.getReviewQueue(),
    select: (res) => res.data?.data ?? [],
  });

export const useChapterReview = (chapterId: string) =>
  useQuery({
    queryKey: KEYS.chapterReview(chapterId),
    queryFn: () => reviewApi.getChapterReview(chapterId),
    select: (res) => res.data?.data ?? null,
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
