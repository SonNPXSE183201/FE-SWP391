import type { Page } from '../../../types/entities';

// ─── Helper: generate placeholder pages ──────────────────────
const makePage = (
  id: string,
  chapterId: string,
  pageNumber: number,
  status: Page['status'],
  imageUrl: string,
  regionCount = 0,
): Page => ({
  id,
  chapterId,
  pageNumber,
  imageUrl,
  status,
  regionCount,
  createdAt: '2026-05-28T08:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
});

// ─── Chapter ch-4 (28 pages) — has real images for first 6 ──
const CH4_STATUSES: Page['status'][] = [
  'Completed', 'Completed', 'Completed', 'InProgress', 'Completed', 'Completed',
  'InProgress', 'Pending', 'Completed', 'InProgress',
  'NeedsRevision', 'Completed', 'Pending', 'Completed', 'InProgress',
  'Pending', 'Completed', 'Completed', 'NeedsRevision', 'Pending',
  'Completed', 'InProgress', 'Completed', 'Pending', 'Pending',
  'Pending', 'Pending', 'Pending',
];

const ch4Pages: Page[] = CH4_STATUSES.map((status, i) => {
  const num = i + 1;
  const hasRealImage = num <= 12;
  return makePage(
    `pg-4-${num}`,
    'ch-4',
    num,
    status,
    hasRealImage ? `/images/huyen-thoai-samurai/chapters/ch-4/page-${num}.png` : '',
    status === 'Completed' ? Math.floor(Math.random() * 3) + 1 : status === 'InProgress' ? 1 : 0,
  );
});

// ─── Chapter ch-1 (4 pages) — MUST match canvas/data/mockData.ts ─
// page-1: InProgress (3 regions), page-2: Pending (0), page-3: Completed (2), page-4: NeedsRevision (1)
const ch1Pages: Page[] = [
  makePage('page-1', 'ch-1', 1, 'InProgress', 'https://picsum.photos/seed/manga-page-1/1200/1800', 3),
  makePage('page-2', 'ch-1', 2, 'Pending', 'https://picsum.photos/seed/manga-page-2/1200/1800', 0),
  makePage('page-3', 'ch-1', 3, 'Completed', 'https://picsum.photos/seed/manga-page-3/1200/1800', 2),
  makePage('page-4', 'ch-1', 4, 'NeedsRevision', 'https://picsum.photos/seed/manga-page-4/1200/1800', 1),
];

// ─── Chapter ch-2 (22 pages) — all completed ─────────────────
const ch2Pages: Page[] = Array.from({ length: 22 }, (_, i) =>
  makePage(`pg-2-${i + 1}`, 'ch-2', i + 1, 'Completed', '', Math.floor(Math.random() * 3) + 1),
);

// ─── Chapter ch-3 (26 pages) — all completed ─────────────────
const ch3Pages: Page[] = Array.from({ length: 26 }, (_, i) =>
  makePage(`pg-3-${i + 1}`, 'ch-3', i + 1, 'Completed', '', Math.floor(Math.random() * 3) + 1),
);

// ─── Chapter ch-5 (20 pages) — mixed revision ────────────────
const CH5_STATUSES: Page['status'][] = [
  'Completed', 'Completed', 'NeedsRevision', 'Completed', 'Completed',
  'NeedsRevision', 'Completed', 'Completed', 'Completed', 'Completed',
  'Completed', 'Completed', 'Completed', 'NeedsRevision', 'Completed',
  'Completed', 'Completed', 'Completed', 'Completed', 'Completed',
];
const ch5Pages: Page[] = CH5_STATUSES.map((status, i) => {
  const num = i + 1;
  const hasRealImage = num <= 4;
  return makePage(
    `pg-5-${num}`,
    'ch-5',
    num,
    status,
    hasRealImage ? `/images/lac-giua-ngan-ha/chapters/ch-5/page-${num}.png` : '',
    status === 'Completed' ? 2 : 0
  );
});

// ─── Chapter ch-6 (18 pages) — draft, all pending ────────────
const ch6Pages: Page[] = Array.from({ length: 18 }, (_, i) => {
  const num = i + 1;
  const hasRealImage = num <= 4;
  return makePage(
    `pg-6-${num}`,
    'ch-6',
    num,
    'Pending',
    hasRealImage ? `/images/vuon-hoa-mua-dong/chapters/ch-6/page-${num}.png` : '',
    0
  );
});

// ─── Chapter ch-7 (24 pages) — draft ─────────────────────────
const ch7Pages: Page[] = Array.from({ length: 24 }, (_, i) => {
  const num = i + 1;
  const hasRealImage = num <= 4;
  return makePage(
    `pg-7-${num}`,
    'ch-7',
    num,
    'Pending',
    hasRealImage ? `/images/bong-ma-hoc-duong/chapters/ch-7/page-${num}.png` : '',
    0
  );
});

// ─── All pages combined ──────────────────────────────────────
export const MOCK_PAGES: Page[] = [
  ...ch1Pages,
  ...ch2Pages,
  ...ch3Pages,
  ...ch4Pages,
  ...ch5Pages,
  ...ch6Pages,
  ...ch7Pages,
];

// ─── Helper to get pages by chapter ──────────────────────────
export const getPagesByChapterId = (chapterId: string): Page[] =>
  MOCK_PAGES.filter((p) => p.chapterId === chapterId);

// ─── Page Status Config ──────────────────────────────────────
export const PAGE_STATUS_CONFIG = {
  Pending: { label: 'Chờ xử lý', color: 'text-text-muted', bg: 'bg-bg-surface', dotColor: 'bg-text-muted' },
  InProgress: { label: 'Đang làm', color: 'text-info', bg: 'bg-info/10', dotColor: 'bg-info' },
  Completed: { label: 'Hoàn thành', color: 'text-success', bg: 'bg-success/10', dotColor: 'bg-success' },
  NeedsRevision: { label: 'Cần sửa', color: 'text-warning', bg: 'bg-warning/10', dotColor: 'bg-warning' },
} as const;

const DEFAULT_PAGE_STATUS_CONFIG = {
  label: 'Không rõ',
  color: 'text-text-muted',
  bg: 'bg-bg-surface',
  dotColor: 'bg-text-muted',
} as const;

export const getPageStatusConfig = (status: Page['status'] | string) =>
  PAGE_STATUS_CONFIG[status as Page['status']] ?? {
    ...DEFAULT_PAGE_STATUS_CONFIG,
    label: status || DEFAULT_PAGE_STATUS_CONFIG.label,
  };
