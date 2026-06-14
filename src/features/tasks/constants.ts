import type { TaskStatus } from '../../types/entities';
import {
  Clock,
  ClipboardList,
  Eye,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  X,
} from 'lucide-react';

// ─── Task Status Config ──────────────────────────────────────
export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  Pending: { label: 'Chờ nhận', color: 'text-text-secondary', bg: 'bg-bg-surface', icon: Clock },
  In_Progress: { label: 'Đang thực hiện', color: 'text-info', bg: 'bg-info/10', icon: ClipboardList },
  Pending_Review: { label: 'Chờ duyệt', color: 'text-warning', bg: 'bg-warning/10', icon: Eye },
  Approved: { label: 'Đã duyệt', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  Revision: { label: 'Yêu cầu sửa', color: 'text-danger', bg: 'bg-danger/10', icon: RotateCcw },
  Disputed: { label: 'Tranh chấp', color: 'text-warning', bg: 'bg-warning/10', icon: AlertCircle },
  Cancelled: { label: 'Đã hủy', color: 'text-text-muted', bg: 'bg-bg-surface', icon: X },
  Closed: { label: 'Đã đóng', color: 'text-text-muted', bg: 'bg-bg-surface', icon: CheckCircle2 },
};

export const TASK_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ nhận' },
  { value: 'In_Progress', label: 'Đang thực hiện' },
  { value: 'Pending_Review', label: 'Chờ duyệt' },
  { value: 'Approved', label: 'Đã duyệt' },
  { value: 'Revision', label: 'Yêu cầu sửa' },
  { value: 'Disputed', label: 'Tranh chấp' },
  { value: 'Cancelled', label: 'Đã hủy' },
];

// ─── Deadline Formatter ──────────────────────────────────────
export const formatDeadline = (deadline: string) => {
  const d = new Date(deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: `Quá hạn ${Math.abs(days)} ngày`, urgent: true };
  if (days === 0) return { text: 'Hôm nay', urgent: true };
  if (days <= 2) return { text: `Còn ${days} ngày`, urgent: true };
  return { text: d.toLocaleDateString('vi-VN'), urgent: false };
};
