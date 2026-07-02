import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Users,
  UserPlus,
  Loader2,
  Trash2,
  CheckCircle2,
  Clock,
  Circle,
  ChevronDown,
} from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import { fixMojibake } from '../../../utils/fixMojibake';
import { buildAssistantManagementUrl } from '../../assistant-management';
import { useSeriesTeam, useRemoveSeriesTeamMember } from '../hooks/useSeriesTeam';
import { getTeamComposition, type TeamRoleStatus } from '../utils/teamComposition.utils';

interface SeriesTeamPanelProps {
  seriesId: string;
  seriesTitle: string;
  canManage?: boolean;
}

const statusIcon = (status: TeamRoleStatus) => {
  if (status === 'filled') return <CheckCircle2 size={11} className="text-success" />;
  if (status === 'pending') return <Clock size={11} className="text-warning" />;
  return <Circle size={11} className="text-text-muted/50" />;
};

const memberStatusLabel: Record<string, { text: string; cls: string }> = {
  Active: { text: 'Hoạt động', cls: 'bg-success/10 text-success' },
  Pending: { text: 'Chờ phản hồi', cls: 'bg-warning/10 text-warning' },
};

export const SeriesTeamPanel = ({ seriesId, seriesTitle, canManage = true }: SeriesTeamPanelProps) => {
  const navigate = useNavigate();
  const { data: members = [], isLoading } = useSeriesTeam(seriesId);
  const removeMutation = useRemoveSeriesTeamMember(seriesId);
  const [showMembers, setShowMembers] = useState(false);

  const composition = useMemo(() => getTeamComposition(members), [members]);
  const activeMembers = useMemo(
    () => members.filter((m) => m.status !== 'Removed'),
    [members],
  );

  const goToAssistantManagement = () => {
    navigate(buildAssistantManagementUrl(seriesId));
  };

  const handleRemove = async (assistantId: number) => {
    try {
      await removeMutation.mutateAsync({ assistantId });
      toast.success('Đã gỡ thành viên khỏi nhóm');
    } catch {
      toast.error('Không gỡ được thành viên');
    }
  };

  return (
    <div className="bg-bg-secondary border border-border-custom rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Users size={18} className="text-brand" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-text-primary">Nhóm dự án</h3>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                  composition.filledCount === composition.totalRoles
                    ? 'bg-success/10 text-success'
                    : 'bg-brand/10 text-brand'
                }`}
              >
                {composition.filledCount}/{composition.totalRoles}
              </span>
              <HelpTip
                size="sm"
                title="Nhóm làm việc cố định"
                content="Một nhóm vẽ cần đủ 7 vai trò pipeline. Bấm Mời trợ lý để mở trang Quản lý trợ lý."
              />
            </div>
          </div>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={goToAssistantManagement}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium border-none cursor-pointer hover:bg-brand-hover transition-colors shrink-0"
          >
            <UserPlus size={13} />
            Mời trợ lý
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="animate-spin text-brand" />
        </div>
      ) : (
        <>
          {/* Compact role checklist — inline pill row */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {composition.items.map((item) => (
              <span
                key={item.role}
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border ${
                  item.status === 'filled'
                    ? 'border-success/20 bg-success/5 text-success'
                    : item.status === 'pending'
                      ? 'border-warning/20 bg-warning/5 text-warning'
                      : 'border-border-custom bg-bg-surface/40 text-text-muted'
                }`}
                title={item.criteria}
              >
                {statusIcon(item.status)}
                {item.role}
              </span>
            ))}
          </div>

          {/* Members list — collapsible */}
          {activeMembers.length > 0 ? (
            <div>
              <button
                type="button"
                onClick={() => setShowMembers((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-0 transition-colors mb-2"
              >
                <ChevronDown
                  size={13}
                  className={`transition-transform ${showMembers ? 'rotate-180' : ''}`}
                />
                {activeMembers.length} thành viên
              </button>

              {showMembers && (
                <div className="space-y-1.5 animate-fade-in-up">
                  {activeMembers.map((m) => {
                    const status = memberStatusLabel[m.status];
                    return (
                      <div
                        key={`${m.seriesId}-${m.assistantId}`}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bg-surface/60 border border-border-custom"
                      >
                        <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center text-[10px] font-bold text-brand shrink-0">
                          {(m.assistantName || '?').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">
                            {fixMojibake(m.assistantName)}
                          </p>
                          <p className="text-[10px] text-text-muted">{fixMojibake(m.roleInTeam)}</p>
                        </div>
                        {status && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${status.cls} shrink-0`}>
                            {status.text}
                          </span>
                        )}
                        {canManage && m.status !== 'Removed' && (
                          <button
                            type="button"
                            onClick={() => handleRemove(m.assistantId)}
                            className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger/10 border-none bg-transparent cursor-pointer shrink-0"
                            aria-label="Gỡ thành viên"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-3">
              Chưa có trợ lý trong nhóm.{' '}
              {canManage && (
                <button
                  type="button"
                  onClick={goToAssistantManagement}
                  className="text-brand hover:text-brand-hover bg-transparent border-none cursor-pointer p-0 text-xs font-medium"
                >
                  Mời trợ lý →
                </button>
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
};
