import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  Users, UserPlus, Loader2, Trash2, Star, Clock,
  Search, X, BriefcaseBusiness, CheckCircle2, Mail, UserCheck, Filter,
} from 'lucide-react';
import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/axios';
import { CustomSelect } from '../../../components/common/CustomSelect';
import type { SelectOption } from '../../../components/common/CustomSelect';
import { HelpTip } from '../../../components/common/HelpTip';
import { fixMojibake } from '../../../utils/fixMojibake';
import { useSeriesTeam, useInviteSeriesAssistant, useRemoveSeriesTeamMember } from '../hooks/useSeriesTeam';

interface AssistantBrowseItem {
  id: number;
  fullName: string;
  email?: string;
  specialtyTags?: string | null;
  onTimeRate?: number;
  averageRating?: number;
  totalCompletedTasks?: number;
}

interface SeriesTeamPanelProps {
  seriesId: string;
  seriesTitle: string;
  canManage?: boolean;
}

const TEAM_ROLES = ['Vẽ nền', 'Vẽ cận', 'Kẻ line', 'Đổ bóng', 'Tô màu', 'Hiệu ứng', 'Vẽ thoại'];
const SKILL_FILTERS = ['Tất cả', 'Vẽ nền', 'Vẽ cận', 'Kẻ line', 'Đổ bóng', 'Tô màu', 'Hiệu ứng', 'Vẽ thoại'];

const ROLE_OPTIONS: SelectOption[] = TEAM_ROLES.map((role) => ({ value: role, label: role }));
const SKILL_OPTIONS: SelectOption[] = SKILL_FILTERS.map((skill) => ({ value: skill, label: skill }));

const splitTags = (value?: string | null) =>
  (value || '')
    .split(/[,;|]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

interface AssistantBrowseModalProps {
  seriesTitle: string;
  members: Array<{ assistantId: number; status: string }>;
  onClose: () => void;
  onInvite: (assistantId: number, role: string) => Promise<void>;
  invitePending: boolean;
}

const AssistantBrowseModal = ({
  seriesTitle,
  members,
  onClose,
  onInvite,
  invitePending,
}: AssistantBrowseModalProps) => {
  const [browseLoading, setBrowseLoading] = useState(true);
  const [assistants, setAssistants] = useState<AssistantBrowseItem[]>([]);
  const [selectedRole, setSelectedRole] = useState(TEAM_ROLES[0]);
  const [selectedSkill, setSelectedSkill] = useState('Tất cả');
  const [search, setSearch] = useState('');

  const memberByAssistantId = useMemo(
    () => new Map(members.map((m) => [m.assistantId, m])),
    [members],
  );

  const fetchAssistants = useCallback(async () => {
    setBrowseLoading(true);
    try {
      const res = await axiosInstance.get<ApiResponse<{ items?: AssistantBrowseItem[] }>>('/api/Assistants', {
        params: { pageNumber: 1, pageSize: 100 },
      });
      setAssistants(res.data.data?.items ?? []);
    } catch {
      toast.error('Không tải được danh sách trợ lý');
    } finally {
      setBrowseLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssistants();
  }, [fetchAssistants]);

  const filteredAssistants = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return assistants.filter((assistant) => {
      const fullName = fixMojibake(assistant.fullName);
      const tags = fixMojibake(assistant.specialtyTags);
      const text = `${fullName} ${assistant.email ?? ''} ${tags}`.toLowerCase();
      const matchKeyword = !keyword || text.includes(keyword);
      const matchSkill = selectedSkill === 'Tất cả' || splitTags(tags).some((tag) => tag === selectedSkill);
      return matchKeyword && matchSkill;
    });
  }, [assistants, search, selectedSkill]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-3xl max-h-[94vh] shadow-lg-custom animate-scale-in flex flex-col overflow-hidden">

        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-border-custom flex items-center justify-between bg-gradient-to-r from-brand/10 via-brand/[0.04] to-transparent">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center shadow-brand shrink-0">
              <UserPlus size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-text-primary">Danh bạ Trợ lý</h2>
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
              <p className="text-xs text-text-muted mt-0.5 truncate">
                {seriesTitle} · Chọn vai trò rồi bấm Mời
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer shrink-0"
            aria-label="Đóng danh bạ trợ lý"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="shrink-0 px-6 py-4 border-b border-border-custom bg-bg-surface/30 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email hoặc kỹ năng..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                <UserCheck size={13} />
                Vai trò mời
                <HelpTip
                  size="sm"
                  title="Vai trò trong nhóm"
                  content="Vai trò này sẽ hiển thị trong lời mời và danh sách nhóm dự án."
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
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                <Filter size={13} />
                Lọc kỹ năng
                <HelpTip
                  size="sm"
                  title="Lọc theo chuyên môn"
                  content="Chỉ hiển thị trợ lý có tag kỹ năng khớp với lựa chọn."
                  autoCloseMs={0}
                />
              </label>
              <CustomSelect
                options={SKILL_OPTIONS}
                value={selectedSkill}
                onChange={setSelectedSkill}
                placeholder="Tất cả kỹ năng"
                icon={<Filter size={14} />}
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 min-h-0">
          {browseLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
              <Loader2 size={28} className="animate-spin text-brand" />
              <span className="text-sm">Đang tải danh bạ trợ lý...</span>
            </div>
          ) : filteredAssistants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-custom bg-bg-surface p-8 text-center">
              <p className="text-sm font-medium text-text-primary">Chưa tìm thấy trợ lý phù hợp</p>
              <p className="text-xs text-text-muted mt-1.5">Thử đổi từ khóa hoặc chọn &quot;Tất cả&quot; ở bộ lọc kỹ năng.</p>
            </div>
          ) : (
            filteredAssistants.map((a) => {
              const existingMember = memberByAssistantId.get(a.id);
              const isInvited = existingMember?.status === 'Pending';
              const isActive = existingMember?.status === 'Active';
              const tags = splitTags(fixMojibake(a.specialtyTags));
              const displayName = fixMojibake(a.fullName);

              return (
                <div
                  key={a.id}
                  className="rounded-xl bg-bg-surface border border-border-custom p-4 hover:border-brand/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center text-sm font-bold text-brand shrink-0">
                      {displayName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-success/10 text-success">
                            <CheckCircle2 size={10} /> Đã trong nhóm
                          </span>
                        )}
                        {isInvited && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-warning/10 text-warning">
                            Đang chờ phản hồi
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{a.email}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {tags.length > 0 ? tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[11px] font-medium">
                            {tag}
                          </span>
                        )) : (
                          <span className="px-2 py-0.5 rounded-md bg-bg-secondary text-text-muted text-[11px]">
                            Chưa cập nhật kỹ năng
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-text-secondary">
                        <span className="inline-flex items-center gap-1">
                          <Star size={12} className="text-warning" />
                          Điểm {(a.averageRating ?? 0).toFixed(1)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} className="text-info" />
                          Đúng hạn {(a.onTimeRate ?? 0).toFixed(0)}%
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BriefcaseBusiness size={12} className="text-brand" />
                          {a.totalCompletedTasks ?? 0} task hoàn thành
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onInvite(a.id, selectedRole)}
                      disabled={invitePending || isActive || isInvited}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border-none transition-colors ${
                        isActive || isInvited
                          ? 'bg-bg-secondary text-text-muted cursor-not-allowed'
                          : 'bg-brand text-white cursor-pointer hover:bg-brand-hover disabled:opacity-60'
                      }`}
                    >
                      {isActive ? 'Đã thêm' : isInvited ? 'Đã mời' : 'Mời'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-border-custom bg-bg-surface/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-text-muted">
            Vai trò mời: <strong className="text-text-primary">{selectedRole}</strong>
            <span className="mx-2">·</span>
            {filteredAssistants.length}/{assistants.length} trợ lý phù hợp
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export const SeriesTeamPanel = ({ seriesId, seriesTitle, canManage = true }: SeriesTeamPanelProps) => {
  const { data: members = [], isLoading } = useSeriesTeam(seriesId);
  const inviteMutation = useInviteSeriesAssistant(seriesId);
  const removeMutation = useRemoveSeriesTeamMember(seriesId);
  const [showBrowse, setShowBrowse] = useState(false);

  const handleInvite = async (assistantId: number, roleInTeam: string) => {
    try {
      await inviteMutation.mutateAsync({ assistantId, roleInTeam });
      toast.success('Đã gửi lời mời tham gia nhóm dự án');
      setShowBrowse(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Không gửi được lời mời');
    }
  };

  const handleRemove = async (assistantId: number) => {
    try {
      await removeMutation.mutateAsync(assistantId);
      toast.success('Đã gỡ thành viên khỏi nhóm');
    } catch {
      toast.error('Không gỡ được thành viên');
    }
  };

  const statusLabel: Record<string, string> = {
    Active: 'Đang hoạt động',
    Pending: 'Chờ phản hồi',
    Removed: 'Đã gỡ',
    Inactive: 'Tạm nghỉ',
  };

  return (
    <div className="bg-bg-secondary border border-border-custom rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Users size={18} className="text-brand" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-text-primary">Nhóm dự án</h3>
              <HelpTip
                size="sm"
                title="Nhóm làm việc cố định"
                content="Mời trợ lý vào nhóm trước khi giao Task. Chỉ thành viên Active mới xuất hiện trong dropdown giao việc."
              />
            </div>
            <p className="text-[11px] text-text-muted truncate">{seriesTitle}</p>
          </div>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowBrowse(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium border-none cursor-pointer hover:bg-brand-hover"
          >
            <UserPlus size={13} />
            Mời trợ lý
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={22} className="animate-spin text-brand" />
        </div>
      ) : members.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-6">
          Chưa có trợ lý trong nhóm. Mời thành viên trước khi giao Task.
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={`${m.seriesId}-${m.assistantId}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface border border-border-custom"
            >
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-xs font-bold text-brand shrink-0">
                {(m.assistantName || '?').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{fixMojibake(m.assistantName)}</p>
                <p className="text-[11px] text-text-muted">{fixMojibake(m.roleInTeam)}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                m.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}>
                {statusLabel[m.status] ?? m.status}
              </span>
              {canManage && m.status !== 'Removed' && (
                <button
                  type="button"
                  onClick={() => handleRemove(m.assistantId)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 border-none bg-transparent cursor-pointer"
                  aria-label="Gỡ thành viên"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showBrowse && (
        <AssistantBrowseModal
          seriesTitle={seriesTitle}
          members={members}
          onClose={() => setShowBrowse(false)}
          onInvite={handleInvite}
          invitePending={inviteMutation.isPending}
        />
      )}
    </div>
  );
};
