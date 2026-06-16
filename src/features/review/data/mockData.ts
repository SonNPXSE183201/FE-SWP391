import type { Annotation } from '../../../types/entities';
import type { ChapterReviewDetail, ReviewPageItem, ReviewQueueItem } from '../types';

// ─── Review Queue (chapters awaiting QC) ─────────────────────
export const MOCK_REVIEW_QUEUE: ReviewQueueItem[] = [
  {
    chapterId: 'rev-ch-1',
    seriesId: 'series-1',
    seriesTitle: 'Huyền Thoại Samurai',
    chapterNumber: 5,
    title: 'Thanh kiếm thức tỉnh',
    mangakaName: 'Nguyễn Minh Đức',
    coverUrl: 'https://picsum.photos/seed/samurai-cover/200/280',
    submittedAt: '2026-06-14T08:00:00Z',
    deadline: '2026-06-18T23:59:59Z',
    pageCount: 5,
    genkouryoPrice: 150000,
    status: 'Pending_Review',
  },
  {
    chapterId: 'rev-ch-2',
    seriesId: 'series-2',
    seriesTitle: 'Học Viện Pháp Sư',
    chapterNumber: 12,
    title: 'Kỳ thi nhập học',
    mangakaName: 'Trần Lê Hương',
    coverUrl: 'https://picsum.photos/seed/mage-cover/200/280',
    submittedAt: '2026-06-15T10:30:00Z',
    deadline: '2026-06-25T23:59:59Z',
    pageCount: 4,
    genkouryoPrice: 180000,
    status: 'Pending_Review',
  },
  {
    chapterId: 'rev-ch-3',
    seriesId: 'series-3',
    seriesTitle: 'Đầu Bếp Thượng Hạng',
    chapterNumber: 8,
    title: 'Trận chiến nhà bếp',
    mangakaName: 'Phạm Quốc Anh',
    coverUrl: 'https://picsum.photos/seed/chef-cover/200/280',
    submittedAt: '2026-06-13T14:00:00Z',
    deadline: '2026-06-17T23:59:59Z',
    pageCount: 4,
    genkouryoPrice: 120000,
    status: 'Revision',
  },
];

// ─── Page + Annotation builders ──────────────────────────────
const buildPages = (chapterId: string, count: number): ReviewPageItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${chapterId}-page-${i + 1}`,
    pageNumber: i + 1,
    imageUrl: `https://picsum.photos/seed/${chapterId}-p${i + 1}/1200/1750`,
  }));

const now = '2026-06-15T09:00:00Z';

// Seed a few QC errors so the editor sees Invalid pages immediately (F3.2).
const buildSeedAnnotations = (chapterId: string): Annotation[] => [
  {
    id: `${chapterId}-anno-1`,
    pageId: `${chapterId}-page-1`,
    editorId: 'editor-1',
    editorName: 'Tantou Editor',
    type: 'Technical',
    x: 360,
    y: 280,
    comment: 'Line weight chưa đều ở khung tranh phía trên.',
    resolved: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: `${chapterId}-anno-2`,
    pageId: `${chapterId}-page-2`,
    editorId: 'editor-1',
    editorName: 'Tantou Editor',
    type: 'Content',
    x: 540,
    y: 620,
    comment: 'Thoại không khớp kịch bản, kiểm tra lại lời nhân vật chính.',
    resolved: false,
    createdAt: now,
    updatedAt: now,
  },
];

export const buildChapterReviewDetail = (chapterId: string): ChapterReviewDetail | null => {
  const item = MOCK_REVIEW_QUEUE.find((c) => c.chapterId === chapterId);
  if (!item) return null;
  return {
    ...item,
    pages: buildPages(chapterId, item.pageCount),
    annotations: buildSeedAnnotations(chapterId),
  };
};
