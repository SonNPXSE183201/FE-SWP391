import { components } from '../../api/generated/schema';

// ─── Chapter Review (QC) Types ───────────────────────────────

export type ChapterReviewStatus = 'Pending_Review' | 'Revision';

export type ReviewQueueItem = components["schemas"]["Chapter"] & {
  series?: {
    title?: string;
    mangaka?: {
      fullName?: string;
    };
    coverImageUrl?: string;
  };
};
export type ChapterReviewDetail = components["schemas"]["Chapter"] & {
  Annotations?: Record<string, unknown>[];
  annotations?: Record<string, unknown>[];
};
export type ReviewPageItem = components["schemas"]["PageDto"];

export interface ApproveChapterPayload {
  chapterId: string;
  validPageCount: number;
  genkouryo: number;
}
