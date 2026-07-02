import type { SelectOption } from '../../../components/common/CustomSelect';

export const TEAM_ROLES = ['Vẽ nền', 'Vẽ cận', 'Kẻ line', 'Đổ bóng', 'Tô màu', 'Hiệu ứng', 'Vẽ thoại'] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];

export const ROLE_OPTIONS: SelectOption[] = TEAM_ROLES.map((role) => ({ value: role, label: role }));

/** Pipeline sản xuất trang manga — thứ tự và tiêu chí từng vai trò trong nhóm */
export const TEAM_ROLE_DEFINITIONS: ReadonlyArray<{
  role: TeamRole;
  description: string;
  criteria: string;
}> = [
  {
    role: 'Vẽ nền',
    description: 'Bối cảnh, phong cảnh, không gian chính của trang',
    criteria: 'Ít nhất 1 trợ lý Active phụ trách nền / phối cảnh',
  },
  {
    role: 'Vẽ cận',
    description: 'Vật thể cận, chi tiết tiền cảnh, đạo cụ nổi bật',
    criteria: 'Ít nhất 1 trợ lý Active cho lớp cận / chi tiết',
  },
  {
    role: 'Kẻ line',
    description: 'Đường nét nhân vật, khung tranh, nét sạch trước tô',
    criteria: 'Ít nhất 1 trợ lý Active chuyên kẻ line',
  },
  {
    role: 'Đổ bóng',
    description: 'Ánh sáng, bóng đổ, độ sâu sau khi có line',
    criteria: 'Ít nhất 1 trợ lý Active cho shading / đổ bóng',
  },
  {
    role: 'Tô màu',
    description: 'Phủ màu flat, tone màu theo style series',
    criteria: 'Ít nhất 1 trợ lý Active cho tô màu',
  },
  {
    role: 'Hiệu ứng',
    description: 'Hiệu ứng đặc biệt, speed line, ánh sáng dramatic',
    criteria: 'Ít nhất 1 trợ lý Active cho hiệu ứng / SFX hình ảnh',
  },
  {
    role: 'Vẽ thoại',
    description: 'Khung thoại, chữ, dàn trang hội thoại',
    criteria: 'Ít nhất 1 trợ lý Active cho thoại / lettering',
  },
];
