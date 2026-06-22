const ROLE_LABELS: Record<string, string> = {
  Mangaka: 'Mangaka',
  Assistant: 'Trợ lý vẽ',
  Editor: 'Biên tập viên',
  Board: 'Hội đồng BT',
  Admin: 'Quản trị viên',
};

const ROLE_STYLES: Record<string, string> = {
  Mangaka: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  Assistant: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  Editor: 'bg-brand/10 text-brand border-brand/20',
  Board: 'bg-info/10 text-info border-info/20',
  Admin: 'bg-danger/10 text-danger border-danger/20',
};

export const getRoleLabel = (role?: string | null): string => {
  if (!role) return '—';
  return ROLE_LABELS[role] ?? role;
};

export const getRoleBadgeStyle = (role?: string | null): string => {
  if (!role) return 'bg-bg-surface text-text-muted border-border-custom';
  return ROLE_STYLES[role] ?? 'bg-bg-surface text-text-secondary border-border-custom';
};
