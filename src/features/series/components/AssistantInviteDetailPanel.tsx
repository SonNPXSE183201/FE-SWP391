import {
  Star,
  Clock,
  BriefcaseBusiness,
  Mail,
  CheckCircle2,
  X,
  UserCheck,
} from 'lucide-react';
import { fixMojibake } from '../../../utils/fixMojibake';
import type { AssistantBrowseItem } from '../types/assistantBrowse.types';
import {
  getInitials,
  getPerformanceBadge,
  getRoleFit,
  splitTags,
} from '../utils/assistantInvite.utils';

interface AssistantInviteDetailPanelProps {
  assistant: AssistantBrowseItem;
  selectedRole: string;
  memberStatus?: string;
  invitePending: boolean;
  onClose: () => void;
  onInvite: (assistantId: number, role: string) => Promise<void>;
}

export const AssistantInviteDetailPanel = ({
  assistant,
  selectedRole,
  memberStatus,
  invitePending,
  onClose,
  onInvite,
}: AssistantInviteDetailPanelProps) => {
  const isActive = memberStatus === 'Active';
  const isInvited = memberStatus === 'Pending';
  const tags = splitTags(fixMojibake(assistant.specialtyTags));
  const displayName = fixMojibake(assistant.fullName);
  const roleFit = getRoleFit(tags, selectedRole);
  const performance = getPerformanceBadge(
    assistant.averageRating,
    assistant.onTimeRate,
    assistant.totalCompletedTasks,
  );
  const safeRating = assistant.averageRating ?? 0;
  const safeOnTimeRate = assistant.onTimeRate ?? 0;
  const safeCompletedTasks = assistant.totalCompletedTasks ?? 0;

  const inviteLabel = isActive
    ? 'Đã trong nhóm'
    : isInvited
      ? 'Đã gửi lời mời'
      : `Mời vào vai trò ${selectedRole}`;

  return (
    <aside
      className="w-full max-w-lg bg-bg-secondary border border-border-custom rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-left max-h-[calc(100vh-2rem)] my-4 mr-4"
      role="complementary"
      aria-label={`Chi tiết ${displayName}`}
    >
      <div className="shrink-0 px-5 py-4 border-b border-border-custom bg-gradient-to-br from-brand/10 via-transparent to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-base font-bold text-brand shrink-0">
              {getInitials(displayName)}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-text-primary truncate">{displayName}</h3>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                <Mail size={12} className="shrink-0" />
                <span className="truncate">{assistant.email}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer shrink-0"
            aria-label="Đóng chi tiết"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${roleFit.toneClass}`}
          >
            {roleFit.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${performance.toneClass}`}
          >
            {performance.label}
          </span>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-success/10 text-success">
              <CheckCircle2 size={10} />
              Đã trong nhóm
            </span>
          )}
          {isInvited && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-warning/10 text-warning">
              Đang chờ phản hồi
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border-custom bg-bg-surface p-3 text-center">
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-warning/10 text-warning">
              <Star size={13} />
            </div>
            <p className="text-lg font-semibold text-text-primary mt-2">{safeRating.toFixed(1)}</p>
            <p className="text-[10px] text-text-muted mt-0.5">Điểm đánh giá</p>
          </div>
          <div className="rounded-xl border border-border-custom bg-bg-surface p-3 text-center">
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-info/10 text-info">
              <Clock size={13} />
            </div>
            <p className="text-lg font-semibold text-text-primary mt-2">{safeOnTimeRate.toFixed(0)}%</p>
            <p className="text-[10px] text-text-muted mt-0.5">Đúng hạn</p>
          </div>
          <div className="rounded-xl border border-border-custom bg-bg-surface p-3 text-center">
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand/10 text-brand">
              <BriefcaseBusiness size={13} />
            </div>
            <p className="text-lg font-semibold text-text-primary mt-2">{safeCompletedTasks}</p>
            <p className="text-[10px] text-text-muted mt-0.5">Task xong</p>
          </div>
        </div>

        <div className="rounded-xl border border-border-custom bg-bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-text-muted">Đánh giá nhanh</p>
          <p className="text-sm text-text-primary mt-2 leading-6">
            <strong className="text-brand">{selectedRole}</strong>: {roleFit.description}
          </p>
          <p className="text-xs text-text-muted mt-2">{performance.description}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-muted mb-2">Kỹ năng</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                    tag === selectedRole
                      ? 'bg-success/15 text-success ring-1 ring-success/25'
                      : 'bg-brand/10 text-brand'
                  }`}
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-bg-secondary text-text-muted text-[11px]">
                Chưa cập nhật kỹ năng
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border-custom bg-bg-surface/60 p-3 flex items-start gap-2">
          <UserCheck size={14} className="text-brand shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-5">
            Vai trò mời: <strong className="text-text-primary">{selectedRole}</strong>.
            {' '}Sau khi trợ lý chấp nhận, bạn có thể giao Task trực tiếp trong nhóm dự án.
          </p>
        </div>
      </div>

      <div className="shrink-0 px-5 py-4 border-t border-border-custom bg-bg-surface/40">
        <button
          type="button"
          onClick={() => onInvite(assistant.id, selectedRole)}
          disabled={invitePending || isActive || isInvited}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold border-none transition-colors ${
            isActive || isInvited
              ? 'bg-bg-secondary text-text-muted cursor-not-allowed'
              : 'bg-brand text-white cursor-pointer hover:bg-brand-hover disabled:opacity-60'
          }`}
        >
          {inviteLabel}
        </button>
      </div>
    </aside>
  );
};
