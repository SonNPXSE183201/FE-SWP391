import type { Annotation } from '../../types/entities';

// ─── Chapter Review (QC) Types ───────────────────────────────

export type ChapterReviewStatus = 'Pending_Review' | 'Revision';

export interface ReviewQueueItem {
  chapterId: string;
  seriesId: string;
  seriesTitle: string;
  chapterNumber: number;
  title: string;
  mangakaName: string;
  coverUrl?: string;
  submittedAt: string;
  deadline: string;
  pageCount: number;
  /** Genkoūryō unit price (VND per valid page) — from Contract/Addendum (G02). */
  genkouryoPrice: number;
  status: ChapterReviewStatus;
}

export interface ReviewPageItem {
  id: string;
  pageNumber: number;
  imageUrl: string;
}

export interface ChapterReviewDetail extends ReviewQueueItem {
  pages: ReviewPageItem[];
  annotations: Annotation[];
}

export interface ApproveChapterPayload {
  chapterId: string;
  validPageCount: number;
  genkouryo: number;
}
