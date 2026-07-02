import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  BookOpen,
  User,
  Calendar,
  Users,
  Clapperboard,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Clock,
} from 'lucide-react';
import type { AssistantInviteDto } from '../hooks/useAssistantInvites';

interface InviteDetailModalProps {
  invite: AssistantInviteDto;
  onClose: () => void;
  onRespond: (accept: boolean) => void;
  isPending: boolean;
}

const STATUS_STYLES: Record<string, { label: string; dot: string; text: string }> = {
  Draft: { label: 'Bản nháp', dot: 'bg-text-muted', text: 'text-text-muted' },
  Submitted: { label: 'Đã nộp', dot: 'bg-info', text: 'text-info' },
  'Under Review': { label: 'Đang duyệt', dot: 'bg-warning', text: 'text-warning' },
  Approved: { label: 'Đã duyệt', dot: 'bg-success', text: 'text-success' },
  Published: { label: 'Đã xuất bản', dot: 'bg-brand', text: 'text-brand' },
};

export const InviteDetailModal = ({
  invite,
  onClose,
  onRespond,
  isPending,
}: InviteDetailModalProps) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const status = STATUS_STYLES[invite.seriesStatus ?? ''] ?? {
    label: invite.seriesStatus ?? 'Không rõ',
    dot: 'bg-text-muted',
    text: 'text-text-muted',
  };

  const roles = invite.roleInTeam
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);

  const genres = (invite.genre ?? '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);

  const inviteDate = new Date(invite.createAt).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[40rem] bg-bg-secondary rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.55)] animate-scale-in overflow-hidden max-h-[min(90vh,48rem)] flex flex-col border border-white/[0.06]"
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết lời mời — ${invite.seriesTitle}`}
      >
        {/* ─── HEADER ─── */}
        <div className="relative shrink-0 px-6 pt-6 pb-5">
          {/* Decorative gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/[0.06] via-transparent to-info/[0.04]" />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-pointer bg-transparent border-none"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>

          {/* Series identity row */}
          <div className="relative flex gap-4 items-start">
            {/* Cover thumbnail */}
            <div className="w-[4.5rem] h-[6.5rem] rounded-xl overflow-hidden bg-bg-surface shrink-0 shadow-lg ring-1 ring-white/[0.08]">
              {invite.coverUrl ? (
                <img
                  src={invite.coverUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand/15 to-info/15">
                  <BookOpen size={24} className="text-text-muted/50" />
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-lg sm:text-xl font-bold text-text-primary leading-snug line-clamp-2">
                {invite.seriesTitle}
              </h2>

              {/* Author + status */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                {invite.mangakaName && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                    <User size={11} className="text-text-muted" />
                    {invite.mangakaName}
                    {invite.mangakaPenName && (
                      <span className="text-text-muted">({invite.mangakaPenName})</span>
                    )}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${status.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>

              {/* Genre tags inline */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {genres.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.04] text-text-muted border border-white/[0.06]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-white/[0.06]" />

        {/* ─── SCROLLABLE BODY ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Invite role highlight */}
          <div className="rounded-xl bg-gradient-to-r from-brand/[0.07] to-brand/[0.02] border border-brand/[0.12] p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={13} className="text-brand" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-brand/70 font-bold">
                Vai trò được mời
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-brand/15 text-brand border border-brand/20"
                >
                  <Clapperboard size={12} />
                  {role}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-text-muted">
              <Clock size={11} />
              Lời mời gửi vào {inviteDate}
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                <Users size={14} className="text-info" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Nhóm hiện tại</p>
                <p className="text-sm font-bold text-text-primary mt-0.5">
                  {invite.teamSize > 0 ? `${invite.teamSize} thành viên` : 'Chưa có ai'}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                <Calendar size={14} className="text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Lịch xuất bản</p>
                <p className="text-sm font-bold text-text-primary mt-0.5 truncate">
                  {invite.publicationSchedule || 'Chưa xác định'}
                </p>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          {invite.synopsis && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <BookOpen size={12} className="text-text-muted" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted font-semibold">
                  Tóm tắt nội dung
                </span>
              </div>
              <p className="text-[13px] text-text-secondary leading-[1.7] whitespace-pre-line">
                {invite.synopsis}
              </p>
            </div>
          )}
        </div>

        {/* ─── FOOTER ─── */}
        <div className="shrink-0 px-6 py-4 border-t border-white/[0.06] bg-bg-primary/30 flex items-center justify-between gap-3">
          <p className="text-[11px] text-text-muted hidden sm:block">
            Bấm <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono">Esc</kbd> để đóng
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={() => onRespond(false)}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium border border-border-custom bg-transparent text-text-secondary hover:border-danger/40 hover:text-danger transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Từ chối
            </button>
            <button
              type="button"
              onClick={() => onRespond(true)}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold border-none bg-success hover:bg-green-600 text-white cursor-pointer transition-all hover:shadow-[0_4px_16px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Chấp nhận
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
