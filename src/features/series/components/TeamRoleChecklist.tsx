import { CheckCircle2, Circle, Clock, HelpCircle } from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import type { TeamRoleCompositionItem } from '../utils/teamComposition.utils';

interface TeamRoleChecklistProps {
  items: TeamRoleCompositionItem[];
  filledCount: number;
  totalRoles: number;
  selectedRole?: string;
  onSelectRole?: (role: string) => void;
  compact?: boolean;
}

const statusConfig = {
  filled: {
    icon: CheckCircle2,
    label: 'Đã có',
    rowClass: 'border-success/25 bg-success/5',
    iconClass: 'text-success',
    dotClass: 'bg-success',
  },
  pending: {
    icon: Clock,
    label: 'Chờ phản hồi',
    rowClass: 'border-warning/25 bg-warning/5',
    iconClass: 'text-warning',
    dotClass: 'bg-warning',
  },
  missing: {
    icon: Circle,
    label: 'Còn thiếu',
    rowClass: 'border-border-custom bg-bg-surface/40',
    iconClass: 'text-text-muted',
    dotClass: 'bg-text-muted/40',
  },
} as const;

export const TeamRoleChecklist = ({
  items,
  filledCount,
  totalRoles,
  selectedRole,
  onSelectRole,
  compact = false,
}: TeamRoleChecklistProps) => {
  const interactive = !!onSelectRole;

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-xs font-semibold text-text-primary">Checklist nhóm vẽ</p>
          <HelpTip
            size="sm"
            title="Tiêu chí nhóm dự án"
            content={
              <>
                Một nhóm vẽ manga cần đủ 7 vai trò trong pipeline sản xuất.
                Mỗi vai trò cần ít nhất 1 trợ lý <strong>Active</strong> trước khi giao Task ổn định.
              </>
            }
          />
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
            filledCount === totalRoles
              ? 'bg-success/10 text-success'
              : 'bg-brand/10 text-brand'
          }`}
        >
          {filledCount}/{totalRoles}
        </span>
      </div>

      <div className={`grid gap-1.5 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {items.map((item, index) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          const isSelected = selectedRole === item.role;
          const isClickable = interactive && item.status !== 'filled';

          const content = (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono text-text-muted w-4 shrink-0">{index + 1}</span>
                <Icon size={14} className={`shrink-0 ${config.iconClass}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text-primary truncate">{item.role}</p>
                  {!compact && (
                    <p className="text-[10px] text-text-muted truncate mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.status === 'filled' && item.memberNames[0] && (
                  <span className="text-[10px] text-success truncate max-w-[5rem] hidden sm:inline">
                    {item.memberNames[0]}
                  </span>
                )}
                {item.status === 'pending' && item.pendingCount > 0 && (
                  <span className="text-[10px] text-warning">{item.pendingCount} lời mời</span>
                )}
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.rowClass} border`}>
                  {config.label}
                </span>
              </div>
            </>
          );

          if (isClickable) {
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => onSelectRole!(item.role)}
                title={item.criteria}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-brand/50 bg-brand/10 ring-1 ring-brand/20'
                    : `${config.rowClass} hover:border-brand/30`
                }`}
              >
                {content}
              </button>
            );
          }

          return (
            <div
              key={item.role}
              title={item.criteria}
              className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border ${config.rowClass} ${
                isSelected ? 'ring-1 ring-brand/20 border-brand/40' : ''
              }`}
            >
              {content}
            </div>
          );
        })}
      </div>

      {filledCount < totalRoles && (
        <p className="text-[11px] text-text-muted flex items-start gap-1.5">
          <HelpCircle size={12} className="shrink-0 mt-0.5" />
          {interactive
            ? 'Bấm vai trò còn thiếu để lọc ứng viên phù hợp và mời đúng vị trí.'
            : 'Nhóm chưa đủ vai trò — mời trợ lý theo checklist pipeline bên dưới.'}
        </p>
      )}
    </div>
  );
};
