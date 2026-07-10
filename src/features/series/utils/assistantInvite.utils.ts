import { fixMojibake } from '../../../utils/fixMojibake';
import type { AssistantBrowseItem, PerformanceBadge, RoleFitBadge } from '../types/assistantBrowse.types';

export const splitTags = (value?: string | null) =>
  (value || '')
    .split(/[,;|]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export const getInitials = (name?: string) => {
  const parts = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

export const getRoleFit = (tags: string[], selectedRole: string): RoleFitBadge => {
  const exactMatch = tags.includes(selectedRole);
  if (exactMatch) {
    return {
      score: 3,
      label: 'Khớp vai trò',
      description: `Đã khai báo kỹ năng ${selectedRole.toLowerCase()}, phù hợp để mời ngay cho vai trò này.`,
      toneClass: 'bg-success/10 text-success border-success/20',
    };
  }

  if (tags.length > 0) {
    return {
      score: 2,
      label: 'Có kỹ năng gần',
      description: `Chưa thấy tag ${selectedRole.toLowerCase()}, nhưng vẫn có kỹ năng liên quan để bạn cân nhắc.`,
      toneClass: 'bg-brand/10 text-brand border-brand/20',
    };
  }

  return {
    score: 1,
    label: 'Thiếu hồ sơ',
    description: 'Chưa cập nhật kỹ năng, nên cần dựa thêm vào thành tích và trao đổi trước khi mời.',
    toneClass: 'bg-bg-secondary text-text-muted border-border-custom',
  };
};

export const getPerformanceBadge = (
  rating?: number,
  onTimeRate?: number,
  totalCompletedTasks?: number,
): PerformanceBadge => {
  const safeRating = rating ?? 0;
  const safeOnTime = onTimeRate ?? 0;
  const safeTasks = totalCompletedTasks ?? 0;

  if (safeRating >= 4.7 && safeOnTime >= 95 && safeTasks >= 15) {
    return {
      label: 'Ứng viên nổi bật',
      description: 'Điểm cao, đúng hạn tốt và đã có nhiều task hoàn thành.',
      toneClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      isTopPick: true,
    };
  }

  if (safeRating >= 4.3 && safeOnTime >= 90 && safeTasks >= 8) {
    return {
      label: 'Hiệu suất ổn',
      description: 'Thành tích đủ tốt để giao việc chính nếu kỹ năng phù hợp.',
      toneClass: 'bg-info/10 text-info border-info/20',
      isTopPick: false,
    };
  }

  if (safeTasks >= 1) {
    return {
      label: 'Cần xem thêm',
      description: 'Đã có lịch sử làm việc nhưng nên đối chiếu thêm kỹ năng trước khi mời.',
      toneClass: 'bg-bg-secondary text-text-muted border-border-custom',
      isTopPick: false,
    };
  }

  return {
    label: 'Ít dữ liệu',
    description: 'Chưa có nhiều lịch sử hoàn thành task để so sánh.',
    toneClass: 'bg-bg-secondary text-text-muted border-border-custom',
    isTopPick: false,
  };
};

export const sortAssistantsByRoleFit = (
  assistants: AssistantBrowseItem[],
  selectedRole: string,
): AssistantBrowseItem[] =>
  [...assistants].sort((left, right) => {
    const leftTags = splitTags(fixMojibake(left.specialtyTags));
    const rightTags = splitTags(fixMojibake(right.specialtyTags));
    const leftFit = getRoleFit(leftTags, selectedRole).score;
    const rightFit = getRoleFit(rightTags, selectedRole).score;
    const leftRating = left.averageRating ?? 0;
    const rightRating = right.averageRating ?? 0;
    const leftOnTime = left.onTimeRate ?? 0;
    const rightOnTime = right.onTimeRate ?? 0;
    const leftTasks = left.totalCompletedTasks ?? 0;
    const rightTasks = right.totalCompletedTasks ?? 0;

    return (
      rightFit - leftFit ||
      rightRating - leftRating ||
      rightOnTime - leftOnTime ||
      rightTasks - leftTasks
    );
  });

export const filterAssistants = (
  assistants: AssistantBrowseItem[],
  search: string,
  selectedRole: string,
) => {
  const keyword = search.trim().toLowerCase();
  const filtered = assistants.filter((assistant) => {
    const fullName = fixMojibake(assistant.fullName);
    const tags = fixMojibake(assistant.specialtyTags);
    const text = `${fullName} ${assistant.email ?? ''} ${tags}`.toLowerCase();
    return !keyword || text.includes(keyword);
  });

  return sortAssistantsByRoleFit(filtered, selectedRole);
};

export const isTopPickCandidate = (
  assistant: AssistantBrowseItem,
  selectedRole: string,
  memberStatus?: string,
) => {
  if (memberStatus === 'Active' || memberStatus === 'Pending') return false;

  const tags = splitTags(fixMojibake(assistant.specialtyTags));
  const roleFit = getRoleFit(tags, selectedRole);
  const performance = getPerformanceBadge(
    assistant.averageRating,
    assistant.onTimeRate,
    assistant.totalCompletedTasks,
  );

  return roleFit.score >= 3 || performance.isTopPick;
};
