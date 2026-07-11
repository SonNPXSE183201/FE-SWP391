import type { AnnotationType } from '../types/status.types';

// ─── Phân loại ghim lỗi (kiểm duyệt) — F3.2 ─────────────
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
    short: 'Kỹ thuật',
  },
  Art: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/40',
    icon: '🟡',
    label: 'Lỗi mỹ thuật',
    short: 'Mỹ thuật',
  },
  Content: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    icon: '🔵',
    label: 'Lỗi nội dung',
    short: 'Nội dung',
  },
};
