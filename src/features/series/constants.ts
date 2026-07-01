import type { SeriesStatus, ChapterStatus, PageStatus } from '../../types/entities';
import {
  FileText, Upload, Eye, CheckCircle2, RotateCcw,
} from 'lucide-react';
import { normalizeChapterStatus, normalizePageStatus, normalizeSeriesStatus } from '../../utils/status';

// ─── Series Status Config ────────────────────────────────────
export const SERIES_STATUS_CONFIG: Record<SeriesStatus, { label: string; color: string; bg: string }> = {
  Draft: { label: 'Bản nháp', color: 'text-text-secondary', bg: 'bg-bg-surface' },
  PendingApproval: { label: 'Chờ Editor duyệt', color: 'text-warning', bg: 'bg-warning/10' },
  PendingBoardVote: { label: 'Chờ Hội đồng', color: 'text-brand', bg: 'bg-brand/10' },
  Approved: { label: 'Đã duyệt', color: 'text-info', bg: 'bg-info/10' },
  Published: { label: 'Đang xuất bản', color: 'text-success', bg: 'bg-success/10' },
  OnHold: { label: 'Tạm dừng', color: 'text-text-muted', bg: 'bg-bg-surface' },
  Cancelled: { label: 'Đã hủy', color: 'text-danger', bg: 'bg-danger/10' },
};

export const SERIES_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Draft', label: SERIES_STATUS_CONFIG.Draft.label },
  { value: 'PendingApproval', label: SERIES_STATUS_CONFIG.PendingApproval.label },
  { value: 'PendingBoardVote', label: SERIES_STATUS_CONFIG.PendingBoardVote.label },
  { value: 'Approved', label: SERIES_STATUS_CONFIG.Approved.label },
  { value: 'Published', label: SERIES_STATUS_CONFIG.Published.label },
  { value: 'OnHold', label: SERIES_STATUS_CONFIG.OnHold.label },
  { value: 'Cancelled', label: SERIES_STATUS_CONFIG.Cancelled.label },
];

const DEFAULT_SERIES_STATUS = {
  label: 'Không rõ',
  color: 'text-text-muted',
  bg: 'bg-bg-surface',
};

export const getSeriesStatusConfig = (status: unknown) => {
  const key = normalizeSeriesStatus(status);
  return SERIES_STATUS_CONFIG[key] ?? { ...DEFAULT_SERIES_STATUS, label: String(status || DEFAULT_SERIES_STATUS.label) };
};

// ─── Chapter Status Config ───────────────────────────────────
export const CHAPTER_STATUS_CONFIG: Record<ChapterStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  Draft: { label: 'Bản nháp', color: 'text-text-secondary', bg: 'bg-bg-surface', icon: FileText },
  Submitted: { label: 'Đã nộp', color: 'text-info', bg: 'bg-info/10', icon: Upload },
  UnderReview: { label: 'Chờ biên tập', color: 'text-warning', bg: 'bg-warning/10', icon: Eye },
  Approved: { label: 'Đã duyệt', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  Revision: { label: 'Yêu cầu sửa', color: 'text-danger', bg: 'bg-danger/10', icon: RotateCcw },
  Published: { label: 'Đã xuất bản', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
};

export const CHAPTER_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Draft', label: CHAPTER_STATUS_CONFIG.Draft.label },
  { value: 'UnderReview', label: CHAPTER_STATUS_CONFIG.UnderReview.label },
  { value: 'Revision', label: CHAPTER_STATUS_CONFIG.Revision.label },
  { value: 'Approved', label: CHAPTER_STATUS_CONFIG.Approved.label },
  { value: 'Published', label: CHAPTER_STATUS_CONFIG.Published.label },
];

/** Editor QC queue — cùng giá trị chuẩn hóa với Mangaka, lọc qua normalizeChapterStatus */
export const EDITOR_CHAPTER_REVIEW_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'UnderReview', label: CHAPTER_STATUS_CONFIG.UnderReview.label },
  { value: 'Revision', label: CHAPTER_STATUS_CONFIG.Revision.label },
];

const DEFAULT_CHAPTER_STATUS = {
  label: 'Không rõ',
  color: 'text-text-muted',
  bg: 'bg-bg-surface',
  icon: FileText,
};

export const getChapterStatusConfig = (status: unknown) => {
  const key = normalizeChapterStatus(status);
  return CHAPTER_STATUS_CONFIG[key] ?? { ...DEFAULT_CHAPTER_STATUS, label: String(status || DEFAULT_CHAPTER_STATUS.label) };
};

// ─── Page Status Config ──────────────────────────────────────
export const PAGE_STATUS_CONFIG: Record<PageStatus, { label: string; color: string; bg: string; dotColor: string }> = {
  Pending: { label: 'Chờ xử lý', color: 'text-text-muted', bg: 'bg-bg-surface', dotColor: 'bg-text-muted' },
  InProgress: { label: 'Đang làm', color: 'text-info', bg: 'bg-info/10', dotColor: 'bg-info' },
  Completed: { label: 'Sẵn sàng nộp', color: 'text-success', bg: 'bg-success/10', dotColor: 'bg-success' },
  NeedsRevision: { label: 'Cần sửa', color: 'text-warning', bg: 'bg-warning/10', dotColor: 'bg-warning' },
};

export const PAGE_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: PAGE_STATUS_CONFIG.Pending.label },
  { value: 'InProgress', label: PAGE_STATUS_CONFIG.InProgress.label },
  { value: 'Completed', label: PAGE_STATUS_CONFIG.Completed.label },
  { value: 'NeedsRevision', label: PAGE_STATUS_CONFIG.NeedsRevision.label },
];

const DEFAULT_PAGE_STATUS = {
  label: 'Không rõ',
  color: 'text-text-muted',
  bg: 'bg-bg-surface',
  dotColor: 'bg-text-muted',
};

export const getPageStatusConfig = (status: PageStatus | string | unknown) => {
  const key = normalizePageStatus(status);
  return PAGE_STATUS_CONFIG[key] ?? {
    ...DEFAULT_PAGE_STATUS,
    label: String(status || DEFAULT_PAGE_STATUS.label),
  };
};

// ─── Cover Gradients ─────────────────────────────────────────
export const COVER_GRADIENTS = [
  'from-brand/30 to-secondary/30',
  'from-info/30 to-brand/30',
  'from-success/30 to-info/30',
  'from-warning/30 to-danger/30',
  'from-secondary/30 to-success/30',
  'from-danger/30 to-warning/30',
];

// ─── Series Status Timeline ─────────────────────────────────
export const SERIES_STATUS_STEPS: { key: SeriesStatus; label: string }[] = [
  { key: 'Draft', label: 'Bản nháp' },
  { key: 'PendingApproval', label: 'Chờ Editor' },
  { key: 'PendingBoardVote', label: 'Hội đồng' },
  { key: 'Approved', label: 'Đã duyệt' },
  { key: 'Published', label: 'Đang xuất bản' },
];

export type StepState = 'completed' | 'current' | 'inactive';

export const getStepState = (currentStatus: SeriesStatus, stepKey: SeriesStatus): StepState => {
  const order = SERIES_STATUS_STEPS.map((s) => s.key);
  const currentIdx = order.indexOf(currentStatus);
  const stepIdx = order.indexOf(stepKey);

  if (currentStatus === 'Cancelled' || currentStatus === 'OnHold') {
    if (stepIdx === 0) return 'completed';
    return 'inactive';
  }
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'current';
  return 'inactive';
};

type StatusFilterOption = { value: string; label: string };
