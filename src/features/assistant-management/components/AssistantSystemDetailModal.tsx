import { useState } from 'react';
import { AnimatedModal } from '../../../components/common/animation';
import {
  Star,
  Clock,
  BriefcaseBusiness,
  Mail,
  X,
  ExternalLink,
  User,
  Sparkles,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { fixMojibake } from '../../../utils/fixMojibake';
import type { AssistantBrowseItem } from '../../series/types/assistantBrowse.types';
import {
  getPerformanceBadge,
  splitTags,
} from '../../series/utils/assistantInvite.utils';
import { AssistantAvatar } from './AssistantAvatar';
import { InviteConfirmPopover } from './InviteConfirmPopover';

interface AssistantSystemDetailModalProps {
  assistant: AssistantBrowseItem;
  onClose: () => void;
}

export const AssistantSystemDetailModal = ({
  assistant,
  onClose,
}: AssistantSystemDetailModalProps) => {
  const [showInvitePopover, setShowInvitePopover] = useState(false);

  const displayName = fixMojibake(assistant.fullName);
  const penName = fixMojibake(assistant.penName);
  const tags = splitTags(fixMojibake(assistant.specialtyTags));
  const performance = getPerformanceBadge(
    assistant.averageRating,
    assistant.onTimeRate,
    assistant.totalCompletedTasks,
  );
  const safeRating = assistant.averageRating ?? 0;
  const safeOnTimeRate = assistant.onTimeRate ?? 0;
  const safeCompletedTasks = assistant.totalCompletedTasks ?? 0;
  const safeActiveTasks = assistant.currentActiveTasks ?? 0;
  const safeDisputeRate = assistant.disputeRate ?? 0;

  return (
    <AnimatedModal
      open
      onClose={onClose}
      containerClassName="flex items-center justify-center p-4 sm:p-6"
      backdropClassName="absolute inset-0 bg-black/70 backdrop-blur-md"
      panelClassName="relative w-full max-w-[58rem] bg-bg-secondary rounded-[24px] shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden max-h-[min(92vh,52rem)] flex flex-col border border-white/[0.07]"
    >
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-60 h-60 bg-brand/20 rounded-full blur-[80px]" />
        <div className="pointer-events-none absolute -top-10 right-20 w-40 h-40 bg-info/10 rounded-full blur-[60px]" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/8 transition-colors cursor-pointer bg-transparent border-none"
          aria-label="Đóng"
        >
          <X size={16} />
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* ─── HEADER SECTION ─── */}
          <div className="relative px-6 sm:px-8 pt-6 sm:pt-8 pb-6 bg-gradient-to-b from-white/[0.03] to-transparent">
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start">
              {/* Avatar */}
              <div className="relative shrink-0">
                <AssistantAvatar
                  name={displayName}
                  avatarUrl={assistant.avatarUrl}
                  size="xl"
                  className="!w-[5.5rem] !h-[5.5rem] !text-2xl !rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-2 ring-white/10"
                />
                {/* Online/performance dot */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[2.5px] border-bg-secondary ${performance.isTopPick ? 'bg-amber-400 animate-pulse-dot' : 'bg-success'}`} />
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${performance.toneClass}`}
                  >
                    <Sparkles size={10} />
                    {performance.label}
                  </span>
                  {safeActiveTasks > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-info/10 text-info border border-info/20">
                      <Zap size={10} />
                      {safeActiveTasks} task đang làm
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-[1.75rem] font-bold text-text-primary tracking-tight leading-tight">
                  {displayName}
                </h2>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-sm text-text-secondary">
                  {penName && (
                    <span className="inline-flex items-center gap-1.5">
                      <User size={13} className="text-text-muted" />
                      <span className="truncate">{penName}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={12} className="text-info/70" />
                    <span className="truncate">{assistant.email}</span>
                  </span>
                </div>

                {/* Portfolio link inline */}
                {assistant.portfolioUrl && (
                  <a
                    href={assistant.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-brand hover:text-brand-hover transition-colors no-underline group"
                  >
                    <ExternalLink size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    Xem Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ─── COMPACT STATS ROW ─── */}
          <div className="mx-6 sm:mx-8 mb-4 flex items-center rounded-xl border border-white/[0.06] bg-white/[0.02] divide-x divide-white/[0.06]">
            <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
              <Star size={14} className="text-warning shrink-0" />
              <span className="text-sm font-semibold text-text-primary tabular-nums">{safeRating.toFixed(1)}</span>
              <span className="text-xs text-text-muted">đánh giá</span>
            </div>
            <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
              <Clock size={14} className="text-success shrink-0" />
              <span className="text-sm font-semibold text-text-primary tabular-nums">{safeOnTimeRate.toFixed(0)}%</span>
              <span className="text-xs text-text-muted">đúng hạn</span>
            </div>
            <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
              <BriefcaseBusiness size={14} className="text-brand shrink-0" />
              <span className="text-sm font-semibold text-text-primary tabular-nums">{safeCompletedTasks}</span>
              <span className="text-xs text-text-muted">task xong</span>
            </div>
          </div>

          {/* ─── BODY SECTION ─── */}
          <div className="px-6 sm:px-8 py-5 space-y-4">
            {/* System Assessment + Dispute alert row */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
              <div className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/[0.08] via-brand/[0.03] to-transparent p-5 relative overflow-hidden">
                {/* Decorative accent line */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand to-brand/20 rounded-r-full" />
                <div className="pl-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-brand" />
                    <p className="text-[11px] uppercase tracking-[0.2em] text-brand/80 font-semibold">
                      Nhận định hệ thống
                    </p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-text-primary leading-7">
                    {performance.description}
                  </p>
                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                    {safeActiveTasks > 0
                      ? `Hiện đang xử lý ${safeActiveTasks} task. Cân nhắc khối lượng trước khi giao thêm.`
                      : 'Hiện không có task đang mở — sẵn sàng nhận việc mới.'}
                  </p>
                </div>
              </div>

              {/* Dispute warning (conditionally shown) */}
              {safeDisputeRate > 0 && (
                <div className="rounded-2xl border border-warning/20 bg-warning/[0.06] p-5 flex flex-col items-center justify-center min-w-[140px]">
                  <AlertTriangle size={20} className="text-warning mb-2" />
                  <p className="text-xl font-bold text-warning tabular-nums">{safeDisputeRate.toFixed(1)}%</p>
                  <p className="text-[11px] text-warning/80 mt-1 text-center font-medium">Tỷ lệ tranh chấp</p>
                </div>
              )}
            </div>

            {/* Skills section */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-text-muted" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-text-secondary font-semibold">
                    Kỹ năng chuyên môn
                  </p>
                </div>
                <span className="text-[11px] text-text-muted tabular-nums">{tags.length} mục</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag, i) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] text-text-secondary border border-white/[0.08] hover:bg-white/[0.07] hover:text-text-primary transition-colors cursor-default"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-muted italic">Chưa cập nhật kỹ năng</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── FOOTER ACTION BAR ─── */}
        <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-white/[0.06] bg-bg-primary/40 backdrop-blur-sm flex items-center justify-end">
          <button
            type="button"
            onClick={() => setShowInvitePopover(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-none transition-all sm:min-w-[11rem] bg-gradient-to-r from-brand to-brand-hover hover:shadow-brand hover:-translate-y-0.5 text-white cursor-pointer"
          >
            <UserPlus size={15} />
            Mời trợ lý
          </button>
        </div>

        {showInvitePopover && (
          <InviteConfirmPopover
            assistant={assistant}
            onClose={() => setShowInvitePopover(false)}
          />
        )}
    </AnimatedModal>
  );
};
