import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, Loader2, Search, X, UserCheck } from 'lucide-react';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { HelpTip } from '../../../components/common/HelpTip';
import { ROLE_OPTIONS } from '../constants/teamRoles';
import { useBrowseAssistants, useFilteredAssistants } from '../hooks/useBrowseAssistants';
import type { AssistantBrowseItem } from '../types/assistantBrowse.types';
import { getTeamComposition } from '../utils/teamComposition.utils';
import { AssistantInviteCandidateRow } from './AssistantInviteCandidateRow';
import { AssistantInviteDetailPanel } from './AssistantInviteDetailPanel';
import { TeamRoleChecklist } from './TeamRoleChecklist';

interface TeamMemberRef {
  assistantId: number;
  status: string;
  roleInTeam: string;
  assistantName?: string | null;
}

interface AssistantInviteDrawerProps {
  seriesTitle: string;
  members: TeamMemberRef[];
  initialRole?: string;
  onClose: () => void;
  onInvite: (assistantId: number, role: string) => Promise<void>;
  invitePending: boolean;
}

export const AssistantInviteDrawer = ({
  seriesTitle,
  members,
  initialRole,
  onClose,
  onInvite,
  invitePending,
}: AssistantInviteDrawerProps) => {
  const composition = useMemo(() => getTeamComposition(members), [members]);
  const [selectedRole, setSelectedRole] = useState(initialRole ?? composition.suggestedInviteRole);
  const [search, setSearch] = useState('');
  const [detailAssistant, setDetailAssistant] = useState<AssistantBrowseItem | null>(null);

  const { data: assistants = [], isLoading } = useBrowseAssistants();

  const memberByAssistantId = useMemo(
    () => new Map(members.map((m) => [m.assistantId, m])),
    [members],
  );

  const { filteredAssistants, topPicks, restAssistants } = useFilteredAssistants(
    assistants,
    search,
    selectedRole,
    memberByAssistantId,
  );

  const handleCloseDetail = () => setDetailAssistant(null);

  const handleViewDetail = (assistant: AssistantBrowseItem) => {
    setDetailAssistant((prev) => (prev?.id === assistant.id ? null : assistant));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedRole(initialRole ?? composition.suggestedInviteRole);
  }, [initialRole, composition.suggestedInviteRole]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (detailAssistant) {
        setDetailAssistant(null);
        return;
      }
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, detailAssistant]);

  const renderRow = (assistant: AssistantBrowseItem, highlighted = false) => (
    <AssistantInviteCandidateRow
      key={assistant.id}
      assistant={assistant}
      selectedRole={selectedRole}
      memberStatus={memberByAssistantId.get(assistant.id)?.status}
      invitePending={invitePending}
      isDetailOpen={detailAssistant?.id === assistant.id}
      onViewDetail={handleViewDetail}
      onInvite={onInvite}
      highlighted={highlighted}
    />
  );

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div className="absolute right-0 top-0 bottom-0 flex items-stretch pointer-events-none">
        {detailAssistant && (
          <div className="pointer-events-auto hidden sm:flex items-stretch">
            <AssistantInviteDetailPanel
              assistant={detailAssistant}
              selectedRole={selectedRole}
              memberStatus={memberByAssistantId.get(detailAssistant.id)?.status}
              invitePending={invitePending}
              onClose={handleCloseDetail}
              onInvite={onInvite}
            />
          </div>
        )}

        <aside
          className="pointer-events-auto w-full max-w-md bg-bg-secondary border-l border-border-custom shadow-2xl flex flex-col animate-slide-in-right"
          role="dialog"
          aria-modal="true"
          aria-label="Danh bạ trợ lý"
        >
          {detailAssistant && (
            <div className="sm:hidden border-b border-border-custom">
              <AssistantInviteDetailPanel
                assistant={detailAssistant}
                selectedRole={selectedRole}
                memberStatus={memberByAssistantId.get(detailAssistant.id)?.status}
                invitePending={invitePending}
                onClose={handleCloseDetail}
                onInvite={onInvite}
              />
            </div>
          )}

          <div className="shrink-0 px-5 py-4 border-b border-border-custom bg-gradient-to-r from-brand/10 via-brand/[0.04] to-transparent">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center shadow-brand shrink-0">
                  <UserPlus size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-bold text-text-primary">Mời trợ lý</h2>
                    <HelpTip
                      size="sm"
                      title="Chiêu mộ nhóm dự án"
                      content={
                        <>
                          Tìm trợ lý theo kỹ năng và mời vào nhóm <strong>{seriesTitle}</strong>.
                          Sau khi trợ lý chấp nhận, bạn có thể giao Task trực tiếp trong nhóm.
                        </>
                      }
                    />
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5 truncate">{seriesTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer shrink-0"
                aria-label="Đóng danh bạ trợ lý"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="shrink-0 px-5 py-4 border-b border-border-custom bg-bg-surface/30 space-y-3">
            <TeamRoleChecklist
              items={composition.items}
              filledCount={composition.filledCount}
              totalRoles={composition.totalRoles}
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
              compact
            />

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                <UserCheck size={13} />
                Vai trò mời
                <HelpTip
                  size="sm"
                  title="Vai trò trong nhóm"
                  content="Chọn vai trò còn thiếu trong checklist — hệ thống ưu tiên ứng viên có kỹ năng khớp."
                  autoCloseMs={0}
                />
              </label>
              <CustomSelect
                options={ROLE_OPTIONS}
                value={selectedRole}
                onChange={setSelectedRole}
                placeholder="Chọn vai trò..."
                icon={<UserCheck size={14} />}
              />
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, email hoặc kỹ năng..."
                className="w-full pl-9 pr-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
                <Loader2 size={26} className="animate-spin text-brand" />
                <span className="text-sm">Đang tải danh bạ trợ lý...</span>
              </div>
            ) : filteredAssistants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-custom bg-bg-surface p-8 text-center">
                <p className="text-sm font-medium text-text-primary">Chưa tìm thấy trợ lý phù hợp</p>
                <p className="text-xs text-text-muted mt-1.5">Thử đổi từ khóa hoặc chọn vai trò khác.</p>
              </div>
            ) : (
              <>
                {topPicks.length > 0 && (
                  <section className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Gợi ý tốt nhất
                      </h3>
                      <span className="text-[11px] text-text-muted">{topPicks.length} ứng viên</span>
                    </div>
                    {topPicks.map((assistant) => renderRow(assistant, true))}
                  </section>
                )}

                {restAssistants.length > 0 && (
                  <section className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        {topPicks.length > 0 ? 'Xem thêm ứng viên' : 'Tất cả ứng viên'}
                      </h3>
                      <span className="text-[11px] text-text-muted">{restAssistants.length} người</span>
                    </div>
                    {restAssistants.map((assistant) => renderRow(assistant))}
                  </section>
                )}
              </>
            )}
          </div>

          <div className="shrink-0 px-5 py-3.5 border-t border-border-custom bg-bg-surface/40">
            <p className="text-[11px] text-text-muted">
              Đang tuyển: <strong className="text-text-primary">{selectedRole}</strong>
              <span className="mx-2">·</span>
              Nhóm {composition.filledCount}/{composition.totalRoles} vai trò
              <span className="mx-2">·</span>
              {filteredAssistants.length} ứng viên khớp
            </p>
          </div>
        </aside>
      </div>
    </div>,
    document.body,
  );
};
