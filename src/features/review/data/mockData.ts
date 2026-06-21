import type { ChapterReviewDetail, ReviewPageItem, ReviewQueueItem } from '../types';

// Partial Series shape used in mock data (avoids full schema requirement).
type MockSeries = NonNullable<ReviewQueueItem['series']>;

// ─── Review Queue (chapters awaiting QC) ─────────────────────
export const MOCK_REVIEW_QUEUE: ReviewQueueItem[] = [
  {
    id: 1,
    seriesId: 1,
    series: { title: 'Huyền Thoại Samurai', mangaka: { fullName: 'Nguyễn Minh Đức' } } as unknown as MockSeries,
    chapterNumber: 5,
    title: 'Thanh kiếm thức tỉnh',
    submissionDeadline: '2026-06-18T23:59:59Z',
    validPageCount: 5,
    appliedGenkouryoPrice: 150000,
    status: 'Pending_Review',
  },
  {
    id: 2,
    seriesId: 2,
    series: { title: 'Học Viện Pháp Sư', mangaka: { fullName: 'Trần Lê Hương' } } as unknown as MockSeries,
    chapterNumber: 12,
    title: 'Kỳ thi nhập học',
    submissionDeadline: '2026-06-25T23:59:59Z',
    validPageCount: 4,
    appliedGenkouryoPrice: 180000,
    status: 'Pending_Review',
  },
  {
    id: 3,
    seriesId: 3,
    series: { title: 'Đầu Bếp Thượng Hạng', mangaka: { fullName: 'Phạm Quốc Anh' } } as unknown as MockSeries,
    chapterNumber: 8,
    title: 'Trận chiến nhà bếp',
    submissionDeadline: '2026-06-17T23:59:59Z',
    validPageCount: 4,
    appliedGenkouryoPrice: 120000,
    status: 'Revision',
  },
];

// ─── Page + Annotation builders ──────────────────────────────
const buildPages = (chapterId: string, count: number): ReviewPageItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: parseInt(chapterId) * 100 + i,
    pageNumber: i + 1,
    compositeImageUrl: `https://picsum.photos/seed/${chapterId}-p${i + 1}/1200/1750`,
  }));

const now = '2026-06-15T09:00:00Z';

// Seed a few QC errors so the editor sees Invalid pages immediately (F3.2).
const buildSeedAnnotations = (chapterId: string): Record<string, unknown>[] => [
  {
    Id: parseInt(chapterId) * 1000 + 1,
    PageId: parseInt(chapterId) * 100,
    EditorId: 1,
    Editor: { FullName: 'Tantou Editor' },
    Type: 'Technical',
    X: 360,
    Y: 280,
    Comment: 'Line weight chưa đều ở khung tranh phía trên.',
    Resolved: false,
    CreateAt: now,
    UpdateAt: now,
  },
  {
    Id: parseInt(chapterId) * 1000 + 2,
    PageId: parseInt(chapterId) * 100 + 1,
    EditorId: 1,
    Editor: { FullName: 'Tantou Editor' },
    Type: 'Content',
    X: 540,
    Y: 620,
    Comment: 'Thoại không khớp kịch bản, kiểm tra lại lời nhân vật chính.',
    Resolved: false,
    CreateAt: now,
    UpdateAt: now,
  },
];

export const buildChapterReviewDetail = (chapterId: string): ChapterReviewDetail | null => {
  const item = MOCK_REVIEW_QUEUE.find((c) => String(c.id) === chapterId);
  if (!item) return null;
  return {
    ...item,
    pages: buildPages(chapterId, item.validPageCount || 0) as unknown as ChapterReviewDetail['pages'],
    annotations: buildSeedAnnotations(chapterId),
  };
};
