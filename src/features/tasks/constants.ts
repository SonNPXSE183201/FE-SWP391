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
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: TASK_STATUS_CONFIG.Pending.label },
  { value: 'In_Progress', label: TASK_STATUS_CONFIG.In_Progress.label },
  { value: 'Pending_Review', label: TASK_STATUS_CONFIG.Pending_Review.label },
  { value: 'Approved', label: TASK_STATUS_CONFIG.Approved.label },
  { value: 'Revision', label: TASK_STATUS_CONFIG.Revision.label },
  { value: 'Disputed', label: TASK_STATUS_CONFIG.Disputed.label },
  { value: 'Cancelled', label: TASK_STATUS_CONFIG.Cancelled.label },
];

/** Task Assistant đang cần làm tiếp */
export const ACTIVE_TASK_STATUSES: TaskStatus[] = ['In_Progress', 'Revision'];

/** Task Mangaka còn khóa tiền / chưa kết thúc */
export const OPEN_TASK_STATUSES: TaskStatus[] = ['Pending', 'In_Progress', 'Pending_Review', 'Revision'];

/** Task Mangaka có thể duyệt / xem kết quả */
export const REVIEWABLE_TASK_STATUSES: TaskStatus[] = ['Pending_Review', 'Revision', 'Approved', 'Disputed'];

export const ASSISTANT_MY_TASK_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Cần làm' },
  { value: 'In_Progress', label: TASK_STATUS_CONFIG.In_Progress.label },
  { value: 'Pending_Review', label: TASK_STATUS_CONFIG.Pending_Review.label },
  { value: 'Revision', label: TASK_STATUS_CONFIG.Revision.label },
  { value: 'Approved', label: TASK_STATUS_CONFIG.Approved.label },
];

const DEFAULT_TASK_STATUS = {
  label: 'Không rõ',
  color: 'text-text-muted',
  bg: 'bg-bg-surface',
  icon: Clock,
};

export const getTaskStatusConfig = (status: unknown) => {
  const key = status === 'Submitted' ? 'Pending_Review' : String(status ?? 'Pending');
  const cfg = TASK_STATUS_CONFIG[key as TaskStatus];
  return cfg ?? { ...DEFAULT_TASK_STATUS, label: String(status || DEFAULT_TASK_STATUS.label) };
};

// ─── Deadline Formatter ──────────────────────────────────────
export const formatDeadline = (deadline: string) => {
  if (!deadline) return { text: 'Chưa có deadline', urgent: false };
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return { text: 'Chưa có deadline', urgent: false };
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: `Quá hạn ${Math.abs(days)} ngày`, urgent: true };
  if (days === 0) return { text: 'Hôm nay', urgent: true };
  if (days <= 2) return { text: `Còn ${days} ngày`, urgent: true };
  return { text: d.toLocaleDateString('vi-VN'), urgent: false };
};
