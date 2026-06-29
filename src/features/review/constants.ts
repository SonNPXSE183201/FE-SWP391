import type { AnnotationType } from '../../types/entities';

// ─── Annotation (QC error) classification — F3.2 ─────────────
export const ANNOTATION_TYPE_CONFIG: Record<
  AnnotationType,
  { color: string; bg: string; border: string; icon: string; label: string; short: string }
> = {
  Technical: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    icon: '🔴',
    label: 'Lỗi kỹ thuật',
    short: 'Technical',
  },
  Art: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/40',
    icon: '🟡',
    label: 'Lỗi mỹ thuật',
    short: 'Art',
  },
  Content: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    icon: '🔵',
    label: 'Lỗi nội dung',
    short: 'Content',
  },
};

// ─── QC Checklist items — F3.6 (must all be ticked to Approve) ─
export const QC_CHECKLIST_ITEMS: string[] = [
  'Tất cả lỗi đã ghim được Mangaka xử lý hoặc chấp nhận bỏ qua',
  'Chất lượng nét vẽ & tô màu đạt chuẩn xuất bản',
  'Thoại khớp kịch bản, không sai chính tả',
  'Bố cục trang & thứ tự đọc chính xác',
  'Số trang hợp lệ (ValidPageCount) đã được xác nhận',
];

export { formatVND } from '../../utils/currency';

/**
 * Deadline status for F3.5 tracking.
 * Returns days remaining and whether an alert should be shown (<= 2 days).
 */
export const getDeadlineStatus = (deadline: string) => {
  const now = new Date();
  const due = new Date(deadline);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return {
    diffDays,
    isOverdue: diffDays < 0,
    isUrgent: diffDays >= 0 && diffDays <= 2,
  };
};
