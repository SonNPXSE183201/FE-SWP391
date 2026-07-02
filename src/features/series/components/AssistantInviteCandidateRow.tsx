import {
  Star,
  Clock,
  BriefcaseBusiness,
  Mail,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { fixMojibake } from '../../../utils/fixMojibake';
import type { AssistantBrowseItem } from '../types/assistantBrowse.types';
import {
  getInitials,
  getPerformanceBadge,
  getRoleFit,
  splitTags,
} from '../utils/assistantInvite.utils';

interface AssistantInviteCandidateRowProps {
  assistant: AssistantBrowseItem;
  selectedRole: string;
  memberStatus?: string;
  invitePending: boolean;
  isDetailOpen?: boolean;
  onViewDetail: (assistant: AssistantBrowseItem) => void;
  onInvite: (assistantId: number, role: string) => Promise<void>;
  highlighted?: boolean;
}

export const AssistantInviteCandidateRow = ({
  assistant,
  selectedRole,
  memberStatus,
  invitePending,
  isDetailOpen = false,
  onViewDetail,
  onInvite,
  highlighted = false,
}: AssistantInviteCandidateRowProps) => {
  const isActive = memberStatus === 'Active';
  const isInvited = memberStatus === 'Pending';
  const displayName = fixMojibake(assistant.fullName);
  const tags = splitTags(fixMojibake(assistant.specialtyTags));
  const roleFit = getRoleFit(tags, selectedRole);
  const performance = getPerformanceBadge(
    assistant.averageRating,
    assistant.onTimeRate,
    assistant.totalCompletedTasks,
  );
  const safeRating = assistant.averageRating ?? 0;
  const safeOnTimeRate = assistant.onTimeRate ?? 0;
  const safeCompletedTasks = assistant.totalCompletedTasks ?? 0;
  const primaryBadge = roleFit.score >= 3 ? roleFit : performance;

  const inviteLabel = isActive
    ? 'Đã thêm'
    : isInvited
      ? 'Đã mời'
      : `Mời · ${selectedRole}`;

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isDetailOpen
          ? 'bg-brand/8 border-brand/40 ring-1 ring-brand/20'
          : highlighted
            ? 'bg-brand/5 border-brand/25'
            : 'bg-bg-surface border-border-custom hover:border-brand/25'
      }`}
    >
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-xs font-bold text-brand shrink-0">
            {getInitials(displayName)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
                  {highlighted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-brand/10 text-brand">
                      <Sparkles size={10} />
                      Gợi ý
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-0.5">
                  <Mail size={11} className="shrink-0" />
                  <span className="truncate">{assistant.email}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void onInvite(assistant.id, selectedRole);
                }}
                disabled={invitePending || isActive || isInvited}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold border-none transition-colors ${
                  isActive || isInvited
                    ? 'bg-bg-secondary text-text-muted cursor-not-allowed'
                    : 'bg-brand text-white cursor-pointer hover:bg-brand-hover disabled:opacity-60'
                }`}
              >
                {inviteLabel}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${primaryBadge.toneClass}`}
              >
                {primaryBadge.label}
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

            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <Star size={11} className="text-warning" />
                {safeRating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={11} className="text-info" />
                {safeOnTimeRate.toFixed(0)}%
              </span>
              <span className="inline-flex items-center gap-1">
                <BriefcaseBusiness size={11} className="text-brand" />
                {safeCompletedTasks} task
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onViewDetail(assistant)}
          className={`mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium bg-transparent border-none cursor-pointer p-0 transition-colors ${
            isDetailOpen ? 'text-brand' : 'text-text-muted hover:text-brand'
          }`}
        >
          {isDetailOpen ? 'Đang xem chi tiết' : 'Xem chi tiết'}
          <ChevronRight size={13} className={isDetailOpen ? 'text-brand' : ''} />
        </button>
      </div>
    </div>
  );
};
