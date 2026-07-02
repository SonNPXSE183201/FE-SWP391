import type {
  ChapterStatus,
  PageStatus,
  SeriesStatus,
  TaskStatus,
} from '../types/entities';

// ─── Series ──────────────────────────────────────────────────

const SERIES_STATUS_ALIASES: Record<string, SeriesStatus> = {
  draft: 'Draft',
  pending_approval: 'PendingApproval',
  pendingapproval: 'PendingApproval',
  pending_board_vote: 'PendingBoardVote',
  pendingboardvote: 'PendingBoardVote',
  fund_pending: 'Approved',
  active: 'Published',
  'in production': 'Published',
  in_production: 'Published',
  approved: 'Approved',
  published: 'Published',
  onhold: 'OnHold',
  cancelled: 'Cancelled',
  rejected: 'Cancelled',
};

export const normalizeSeriesStatus = (status: unknown): SeriesStatus => {
  if (status === 0 || status === '0') return 'Draft';
  if (status === 1 || status === '1') return 'PendingApproval';
  if (status === 2 || status === '2') return 'Approved';
  if (status === 3 || status === '3') return 'Published';
  if (status === 4 || status === '4') return 'OnHold';
  if (status === 5 || status === '5') return 'Cancelled';
  const key = String(status ?? '').trim().toLowerCase();
  if (SERIES_STATUS_ALIASES[key]) return SERIES_STATUS_ALIASES[key];
  return (status as SeriesStatus) || 'Draft';
};

export const seriesStatusMatchesFilter = (status: unknown, filter: string): boolean => {
  if (!filter) return true;
  return normalizeSeriesStatus(status) === filter;
};

// ─── Chapter ─────────────────────────────────────────────────

const CHAPTER_STATUS_ALIASES: Record<string, ChapterStatus> = {
  Draft: 'Draft',
  Submitted: 'UnderReview',
  Pending_Review: 'UnderReview',
  UnderReview: 'UnderReview',
  Approved: 'Approved',
  Revision: 'Revision',
  Rejected: 'Revision',
  Published: 'Published',
};

export const normalizeChapterStatus = (status: unknown): ChapterStatus => {
  const key = String(status ?? '');
  if (CHAPTER_STATUS_ALIASES[key]) return CHAPTER_STATUS_ALIASES[key];
  return 'Draft';
};

export const chapterStatusMatchesFilter = (status: unknown, filter: string): boolean => {
  if (!filter) return true;
  return normalizeChapterStatus(status) === filter;
};

const SUBMITTABLE_CHAPTER_STATUSES: ChapterStatus[] = ['Draft', 'Revision'];

export const isChapterSubmittableStatus = (status: unknown): boolean =>
  SUBMITTABLE_CHAPTER_STATUSES.includes(normalizeChapterStatus(status));

// ─── Page ────────────────────────────────────────────────────

const PAGE_STATUS_ALIASES: Record<string, PageStatus> = {
  Pending: 'Pending',
  InProgress: 'InProgress',
  Completed: 'Completed',
  NeedsRevision: 'NeedsRevision',
  Composited: 'Completed',
  Approved: 'Completed',
};

export const normalizePageStatus = (status: unknown): PageStatus => {
  if (status === 0 || status === '0') return 'Pending';
  if (status === 1 || status === '1') return 'InProgress';
  if (status === 2 || status === '2') return 'NeedsRevision';
  if (status === 3 || status === '3') return 'Completed';
  const key = String(status ?? '');
  if (PAGE_STATUS_ALIASES[key]) return PAGE_STATUS_ALIASES[key];
  return 'Pending';
};

export const pageStatusMatchesFilter = (status: unknown, filter: string): boolean => {
  if (!filter) return true;
  return normalizePageStatus(status) === filter;
};

export const PAGE_STATUSES: PageStatus[] = ['Pending', 'InProgress', 'Completed', 'NeedsRevision'];

export const countPagesByStatus = (pages: { status: PageStatus | string }[]) => {
  const counts: Record<PageStatus, number> = {
    Pending: 0,
    InProgress: 0,
    Completed: 0,
    NeedsRevision: 0,
  };
  pages.forEach((page) => {
    const key = normalizePageStatus(page.status);
    counts[key] += 1;
  });
  return {
    total: pages.length,
    pending: counts.Pending,
    inProgress: counts.InProgress,
    completed: counts.Completed,
    revision: counts.NeedsRevision,
  };
};

// ─── Task ────────────────────────────────────────────────────

export const normalizeTaskStatus = (status?: string | null): TaskStatus => {
  if (status === 'Submitted') return 'Pending_Review';
  const key = String(status ?? '');
  const allowed: TaskStatus[] = [
    'Pending',
    'In_Progress',
    'Pending_Review',
    'Approved',
    'Revision',
    'Disputed',
    'Cancelled',
    'Closed',
  ];
  if (allowed.includes(key as TaskStatus)) return key as TaskStatus;
  return 'Pending';
};

export const taskStatusMatchesFilter = (status: unknown, filter: string): boolean => {
  if (!filter) return true;
  return normalizeTaskStatus(String(status ?? '')) === filter;
};

// ─── Filter UI helpers ───────────────────────────────────────

export type StatusFilterOption = { value: string; label: string };

/** Options for CustomSelect: bỏ mục "Tất cả" (dùng placeholder). */
export const toSelectFilterOptions = (options: StatusFilterOption[]): StatusFilterOption[] =>
  options.filter((o) => o.value !== '');
