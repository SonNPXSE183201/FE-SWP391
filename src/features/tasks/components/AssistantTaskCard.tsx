import type { ReactNode } from 'react';
import {
  AlarmClock,
  Calendar,
  ChevronRight,
  Clock,
  Coins,
  Download,
  Eye,
  FileText,
  MapPin,
  RotateCcw,
  Upload,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { TASK_STATUS_CONFIG, formatDeadline } from '../constants';
import { formatVND } from '../../wallet';
import type { AvailableTaskDto } from '../hooks/useTasks';
import type { TaskStatus } from '../../../types/entities';
import { TaskRegionPreview } from './TaskRegionPreview';

const DETAIL_CTA: Partial<Record<TaskStatus, { label: string; icon: LucideIcon; cls: string }>> = {
  In_Progress: { label: 'Nộp bài', icon: Upload, cls: 'bg-success hover:bg-green-600 text-white' },
  Revision: { label: 'Xem & nộp lại', icon: RotateCcw, cls: 'bg-danger/90 hover:bg-danger text-white' },
  Pending_Review: {
    label: 'Xem bài nộp',
    icon: Eye,
    cls: 'bg-bg-surface hover:bg-bg-primary text-text-primary border border-border-custom',
  },
  Approved: {
    label: 'Xem chi tiết',
    icon: Eye,
    cls: 'bg-bg-surface hover:bg-bg-primary text-text-secondary border border-border-custom',
  },
  Disputed: {
    label: 'Xem chi tiết',
    icon: Eye,
    cls: 'bg-bg-surface hover:bg-bg-primary text-text-secondary border border-border-custom',
  },
};

interface AssistantTaskCardProps {
  task: AvailableTaskDto;
  variant: 'available' | 'my';
  acceptPending?: boolean;
  onAccept?: () => void;
  onOpenDetail?: () => void;
  onOpenRegionPreview?: () => void;
}

const MetaItem = ({
  icon: Icon,
  children,
  className = '',
}: {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}) => (
  <span className={`inline-flex items-center gap-1.5 text-xs text-text-secondary ${className}`}>
    <Icon size={13} className="shrink-0 opacity-60" />
    <span className="truncate">{children}</span>
  </span>
);

const getNote = (
  task: AvailableTaskDto,
  isMyTask: boolean,
): { text: ReactNode; cls: string } | null => {
  if (task.status === 'Revision' && task.feedbackComment) {
    return {
      cls: 'bg-danger/8 text-text-secondary border-danger/15',
      text: (
        <>
          <span className="font-semibold text-danger">Góp ý: </span>
          {task.feedbackComment}
        </>
      ),
    };
  }
  if (!isMyTask) return null;
  if (task.status === 'Pending_Review') {
    return { cls: 'bg-warning/8 text-warning/90 border-warning/15', text: 'Đã nộp — đang chờ Mangaka duyệt' };
  }
  if (task.status === 'Approved') {
    return { cls: 'bg-success/8 text-success/90 border-success/15', text: 'Hoàn thành — tiền đã vào ví của bạn' };
  }
  if (task.status === 'Disputed') {
    return { cls: 'bg-warning/8 text-warning/90 border-warning/15', text: 'Đang tranh chấp — Editor xử lý' };
  }
  return null;
};

export const AssistantTaskCard = ({
  task,
  variant,
  acceptPending,
  onAccept,
  onOpenDetail,
  onOpenRegionPreview,
}: AssistantTaskCardProps) => {
  const statusKey = task.status as TaskStatus;
  const statusCfg =
    TASK_STATUS_CONFIG[statusKey] ?? {
      label: task.status ?? 'Không rõ',
      color: 'text-text-muted',
      bg: 'bg-bg-surface',
      icon: Clock,
    };
  const StatusIcon = statusCfg.icon;
  const dl = task.deadline ? formatDeadline(task.deadline) : null;

  const isAvailablePending = variant === 'available' && task.status === 'Pending';
  const isMyTask = variant === 'my';
  const canOpenDetail = isMyTask && !!onOpenDetail;
  const showRegionPreview = !!(task.pageImageUrl || task.regionCoordinatesJson);
  const canExpandRegion = isAvailablePending && !!onOpenRegionPreview && showRegionPreview;
  const detailCta = isMyTask ? DETAIL_CTA[statusKey] : undefined;
  const note = getNote(task, isMyTask);

  const fallbackCta =
    canOpenDetail && !detailCta
      ? { label: 'Xem chi tiết', icon: Eye, cls: 'bg-bg-surface hover:bg-bg-primary text-text-secondary border border-border-custom' }
      : undefined;
  const cta = detailCta ?? fallbackCta;

  return (
    <article
      role={canOpenDetail ? 'button' : undefined}
      tabIndex={canOpenDetail ? 0 : undefined}
      onClick={canOpenDetail ? onOpenDetail : undefined}
      onKeyDown={
        canOpenDetail
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenDetail?.();
              }
            }
          : undefined
      }
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-custom bg-bg-secondary transition-all hover:border-brand/40 hover:shadow-lg hover:shadow-black/10 ${
        canOpenDetail ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40' : ''
      }`}
    >
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Status + deadline */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}
          >
            <StatusIcon size={13} />
            {statusCfg.label}
          </span>
          {dl?.urgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-1 text-[11px] font-semibold text-danger">
              <AlarmClock size={12} />
              {dl.text}
            </span>
          )}
        </div>

        {showRegionPreview && (
          <TaskRegionPreview
            pageId={task.pageId}
            imageUrl={task.pageImageUrl}
            coordinatesJson={task.regionCoordinatesJson}
            regionName={task.regionName}
            expandable={canExpandRegion}
            onExpand={onOpenRegionPreview}
          />
        )}

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand">
          {task.description || 'Công việc chưa đặt tên'}
        </h3>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {task.mangakaName && <MetaItem icon={User}>{task.mangakaName}</MetaItem>}
          {task.regionName && <MetaItem icon={MapPin}>{task.regionName}</MetaItem>}
          {(task.pageNumber ?? 0) > 0 && <MetaItem icon={FileText}>Trang {task.pageNumber}</MetaItem>}
          {dl && !dl.urgent && <MetaItem icon={Calendar}>{dl.text}</MetaItem>}
        </div>

        {/* Note */}
        {note && (
          <p className={`line-clamp-2 rounded-lg border px-2.5 py-1.5 text-[11px] leading-relaxed ${note.cls}`}>
            {note.text}
          </p>
        )}
      </div>

      {/* Footer: payout + action */}
      <div
        className="mt-auto flex items-center justify-between gap-3 border-t border-border-custom bg-bg-surface/50 px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
            <Coins size={11} />
            Thù lao
          </p>
          <p className="text-base font-bold tabular-nums text-brand">{formatVND(task.paymentAmount ?? 0)}</p>
        </div>

        {isAvailablePending && (
          <button
            type="button"
            onClick={onAccept}
            disabled={acceptPending}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border-none bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
          >
            <Download size={15} />
            {acceptPending ? 'Đang nhận…' : 'Nhận việc'}
          </button>
        )}

        {cta && (
          <button
            type="button"
            onClick={onOpenDetail}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${cta.cls}`}
          >
            <cta.icon size={15} />
            {cta.label}
            <ChevronRight size={14} className="opacity-50" />
          </button>
        )}
      </div>
    </article>
  );
};
