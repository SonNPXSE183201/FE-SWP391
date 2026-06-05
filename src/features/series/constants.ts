import type { SeriesStatus, ChapterStatus } from '../../types/entities';

// ─── Series Status Config ────────────────────────────────────
export const SERIES_STATUS_CONFIG: Record<SeriesStatus, { label: string; color: string; bg: string }> = {
  Draft: { label: 'Bản nháp', color: 'text-text-secondary', bg: 'bg-bg-surface' },
  PendingApproval: { label: 'Chờ duyệt', color: 'text-warning', bg: 'bg-warning/10' },
  Approved: { label: 'Đã duyệt', color: 'text-info', bg: 'bg-info/10' },
  Published: { label: 'Đang xuất bản', color: 'text-success', bg: 'bg-success/10' },
  OnHold: { label: 'Tạm dừng', color: 'text-text-muted', bg: 'bg-bg-surface' },
  Cancelled: { label: 'Đã hủy', color: 'text-danger', bg: 'bg-danger/10' },
};

export const SERIES_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Draft', label: 'Bản nháp' },
  { value: 'PendingApproval', label: 'Chờ duyệt' },
  { value: 'Approved', label: 'Đã duyệt' },
  { value: 'Published', label: 'Đang xuất bản' },
  { value: 'OnHold', label: 'Tạm dừng' },
  { value: 'Cancelled', label: 'Đã hủy' },
];

import {
  FileText, Upload, Eye, CheckCircle2, RotateCcw,
} from 'lucide-react';

// ─── Chapter Status Config ───────────────────────────────────
export const CHAPTER_STATUS_CONFIG: Record<ChapterStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  Draft: { label: 'Bản nháp', color: 'text-text-secondary', bg: 'bg-bg-surface', icon: FileText },
  Submitted: { label: 'Đã nộp', color: 'text-info', bg: 'bg-info/10', icon: Upload },
  UnderReview: { label: 'Đang review', color: 'text-warning', bg: 'bg-warning/10', icon: Eye },
  Approved: { label: 'Đã duyệt', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  Revision: { label: 'Yêu cầu sửa', color: 'text-danger', bg: 'bg-danger/10', icon: RotateCcw },
  Published: { label: 'Đã xuất bản', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
};

export const CHAPTER_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Draft', label: 'Bản nháp' },
  { value: 'Submitted', label: 'Đã nộp' },
  { value: 'UnderReview', label: 'Đang review' },
  { value: 'Approved', label: 'Đã duyệt' },
  { value: 'Revision', label: 'Yêu cầu sửa' },
  { value: 'Published', label: 'Đã xuất bản' },
];

export const PAGE_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'InProgress', label: 'Đang làm' },
  { value: 'Completed', label: 'Hoàn thành' },
  { value: 'NeedsRevision', label: 'Cần sửa' },
];

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
  { key: 'PendingApproval', label: 'Chờ duyệt' },
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
