import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import type { TeamRoleCompositionItem } from '../../series/utils/teamComposition.utils';
import { ListTableShell, tableCellClass, tableHeadClass, tableRowClass } from './ListTableShell';

interface TeamRoleTableProps {
  items: TeamRoleCompositionItem[];
  filledCount: number;
  totalRoles: number;
  selectedRole?: string;
  onSelectRole?: (role: string) => void;
  onRemoveMember?: (assistantId: number, role: string) => void;
}

const statusBadge = {
  filled: { label: 'Đã có', className: 'bg-success/10 text-success' },
  pending: { label: 'Chờ phản hồi', className: 'bg-warning/10 text-warning' },
  missing: { label: 'Còn thiếu', className: 'bg-bg-surface text-text-muted border border-border-custom' },
} as const;

export const TeamRoleTable = ({
  items,
  filledCount,
  totalRoles,
  selectedRole,
  onSelectRole,
  onRemoveMember,
}: TeamRoleTableProps) => {
  const interactive = !!onSelectRole;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-text-primary">Checklist nhóm vẽ & Thành viên</h3>
          <HelpTip
            size="sm"
            title="Tiêu chí nhóm dự án"
            content="Mỗi vai trò cần ít nhất 1 trợ lý đang hoạt động. Một vai trò có thể có nhiều trợ lý, và một trợ lý có thể đảm nhận nhiều vai trò."
          />
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
            filledCount === totalRoles ? 'bg-success/10 text-success' : 'bg-brand/10 text-brand'
          }`}
        >
          {filledCount}/{totalRoles} vai trò
        </span>
      </div>

      <ListTableShell isEmpty={false} colSpan={5}>
        <thead className="sticky top-0 z-10">
          <tr>
            <th className={`${tableHeadClass} w-12`}>#</th>
            <th className={tableHeadClass}>Vai trò</th>
            <th className={`${tableHeadClass} hidden md:table-cell`}>Mô tả</th>
            <th className={tableHeadClass}>Trạng thái</th>
            <th className={`${tableHeadClass} min-w-[200px] w-[30%]`}>Thành viên</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const badge = statusBadge[item.status];
            const isSelected = selectedRole === item.role;
            const isClickable = interactive;

            const row = (
              <>
                <td className={`${tableCellClass} text-text-muted font-mono text-xs align-top pt-3.5`}>{index + 1}</td>
                <td className={`${tableCellClass} font-medium text-text-primary align-top pt-3`}>
                  <div className="flex items-center gap-2">
                    {item.status === 'filled' && <CheckCircle2 size={14} className="text-success shrink-0" />}
                    {item.status === 'pending' && <Clock size={14} className="text-warning shrink-0" />}
                    {item.status === 'missing' && <Circle size={14} className="text-text-muted shrink-0" />}
                    {item.role}
                  </div>
                </td>
                <td className={`${tableCellClass} text-text-secondary hidden md:table-cell align-top pt-3`}>{item.description}</td>
                <td className={`${tableCellClass} align-top pt-2.5`}>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className={`${tableCellClass} text-text-secondary align-top py-2`}>
                  {item.roleMembers.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {item.roleMembers.map((m) => (
                        <div
                          key={m.assistantId}
                          className="flex items-center justify-between gap-2 bg-bg-surface/60 border border-border-custom rounded-lg pl-2 pr-1.5 py-1.5 hover:bg-bg-surface/80 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 rounded flex items-center justify-center bg-brand/10 text-[9px] font-bold text-brand shrink-0">
                              {(m.assistantName || '?').charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-text-primary truncate">
                              {m.assistantName}
                            </span>
                            {m.status === 'Pending' && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium bg-warning/10 text-warning">
                                Chờ
                              </span>
                            )}
                          </div>
                          {onRemoveMember && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveMember(m.assistantId, item.role);
                              }}
                              className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger/10 bg-transparent border-none cursor-pointer transition-colors shrink-0"
                              aria-label="Gỡ thành viên"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-block pt-1">—</span>
                  )}
                </td>
              </>
            );

            if (isClickable) {
              return (
                <tr
                  key={item.role}
                  onClick={() => onSelectRole!(item.role)}
                  className={`${tableRowClass} cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand/10 hover:bg-brand/10' : 'hover:bg-bg-surface/30'
                  }`}
                >
                  {row}
                </tr>
              );
            }

            return (
              <tr key={item.role} className={tableRowClass}>
                {row}
              </tr>
            );
          })}
        </tbody>
      </ListTableShell>
    </div>
  );
};
