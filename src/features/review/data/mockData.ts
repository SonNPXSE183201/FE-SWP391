import type { ChapterReviewDetail, ReviewPageItem, ReviewQueueItem } from '../types';

// Partial Series shape used in mock data (avoids full schema requirement).
type MockSeries = NonNullable<ReviewQueueItem['Series']>;

// ─── Review Queue (chapters awaiting QC) ─────────────────────
export const MOCK_REVIEW_QUEUE: ReviewQueueItem[] = [
  {
    Id: 1,
    SeriesId: 1,
    Series: { Title: 'Huyền Thoại Samurai', Mangaka: { FullName: 'Nguyễn Minh Đức' } } as MockSeries,
    ChapterNumber: 5,
    Title: 'Thanh kiếm thức tỉnh',
    SubmissionDeadline: '2026-06-18T23:59:59Z',
    ValidPageCount: 5,
    AppliedGenkouryoPrice: 150000,
    Status: 'Pending_Review',
  },
  {
    Id: 2,
    SeriesId: 2,
    Series: { Title: 'Học Viện Pháp Sư', Mangaka: { FullName: 'Trần Lê Hương' } } as MockSeries,
    ChapterNumber: 12,
    Title: 'Kỳ thi nhập học',
    SubmissionDeadline: '2026-06-25T23:59:59Z',
    ValidPageCount: 4,
    AppliedGenkouryoPrice: 180000,
    Status: 'Pending_Review',
  },
  {
    Id: 3,
    SeriesId: 3,
    Series: { Title: 'Đầu Bếp Thượng Hạng', Mangaka: { FullName: 'Phạm Quốc Anh' } } as MockSeries,
    ChapterNumber: 8,
    Title: 'Trận chiến nhà bếp',
    SubmissionDeadline: '2026-06-17T23:59:59Z',
    ValidPageCount: 4,
    AppliedGenkouryoPrice: 120000,
    Status: 'Revision',
  },
];

// ─── Page + Annotation builders ──────────────────────────────
const buildPages = (chapterId: string, count: number): ReviewPageItem[] =>
  Array.from({ length: count }, (_, i) => ({
    Id: parseInt(chapterId) * 100 + i,
    PageNumber: i + 1,
    CompositeImageUrl: `https://picsum.photos/seed/${chapterId}-p${i + 1}/1200/1750`,
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
  const item = MOCK_REVIEW_QUEUE.find((c) => String(c.Id) === chapterId);
  if (!item) return null;
  return {
    ...item,
    Pages: buildPages(chapterId, item.ValidPageCount || 0) as ChapterReviewDetail['Pages'],
    Annotations: buildSeedAnnotations(chapterId),
  };
};
