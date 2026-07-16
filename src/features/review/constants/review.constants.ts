import type { AnnotationType } from '../../../types/status.types';

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

// ─── Danh mục kiểm tra chất lượng — F3.6 (phải tick hết để duyệt) ─
export const QC_CHECKLIST_ITEMS: string[] = [
  'Tất cả lỗi đã ghim được Mangaka xử lý hoặc chấp nhận bỏ qua',
  'Chất lượng nét vẽ & tô màu đạt chuẩn xuất bản',
  'Thoại khớp kịch bản, không sai chính tả',
  'Bố cục trang & thứ tự đọc chính xác',
  'Số trang hợp lệ đã được xác nhận',
];

export type QCCriterion = {
  code: string;
  label: string;
  description: string;
};

export const QC_CRITERIA: Record<AnnotationType, QCCriterion[]> = {
  Technical: [
    {
      code: 'KT-01',
      label: 'Độ phân giải',
      description: 'Trang bị mờ, vỡ nét hoặc độ phân giải không đủ để xuất bản.',
    },
    {
      code: 'KT-02',
      label: 'Khung/cắt trang',
      description: 'Khung tranh, bleed hoặc vùng cắt trang bị lệch, mất chi tiết quan trọng.',
    },
    {
      code: 'KT-03',
      label: 'Nét/scan',
      description: 'Nét vẽ bị bẩn, nhiễu, đứt nét hoặc còn artefact sau khi xử lý ảnh.',
    },
    {
      code: 'KT-04',
      label: 'Thứ tự đọc',
      description: 'Thứ tự panel, bong bóng thoại hoặc hướng đọc gây nhầm lẫn.',
    },
  ],
  Art: [
    {
      code: 'MT-01',
      label: 'Giải phẫu/tỉ lệ',
      description: 'Tỉ lệ cơ thể, gương mặt hoặc phối cảnh nhân vật chưa hợp lý.',
    },
    {
      code: 'MT-02',
      label: 'Biểu cảm/cử chỉ',
      description: 'Biểu cảm hoặc cử chỉ nhân vật chưa khớp cảm xúc/kịch bản.',
    },
    {
      code: 'MT-03',
      label: 'Ánh sáng/bóng',
      description: 'Ánh sáng, đổ bóng hoặc tương phản chưa thống nhất giữa các khung hình.',
    },
    {
      code: 'MT-04',
      label: 'Bố cục hình',
      description: 'Bố cục khung hình chưa rõ điểm nhấn hoặc làm người đọc khó theo dõi.',
    },
  ],
  Content: [
    {
      code: 'ND-01',
      label: 'Sai thoại/chính tả',
      description: 'Thoại sai chính tả, sai ngữ pháp hoặc không khớp kịch bản.',
    },
    {
      code: 'ND-02',
      label: 'Liên tục cảnh',
      description: 'Diễn biến, đạo cụ, trang phục hoặc vị trí nhân vật bị thiếu liên tục.',
    },
    {
      code: 'ND-03',
      label: 'Nội dung nhạy cảm',
      description: 'Nội dung có yếu tố nhạy cảm hoặc không phù hợp tiêu chuẩn xuất bản.',
    },
    {
      code: 'ND-04',
      label: 'Thiếu thông tin',
      description: 'Khung hình thiếu lời thoại, SFX, chú thích hoặc thông tin cần có.',
    },
  ],
};

export { formatVND } from '../../../utils/currency';

/**
 * Trạng thái deadline cho theo dõi F3.5.
 * Trả về số ngày còn lại và cần hiển thị cảnh báo hay không (<= 2 ngày).
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
