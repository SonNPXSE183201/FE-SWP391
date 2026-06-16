import { useMemo, useState } from 'react';
import {
  FileText, Loader2, User, Calendar, Layers,
  Banknote, AlertTriangle, Clock, ChevronRight, Inbox,
} from 'lucide-react';
import { useReviewQueue } from '../hooks/useReview';
import { formatVND, getDeadlineStatus } from '../constants';
import type { ChapterReviewStatus } from '../types';

interface ReviewQueueProps {
  onSelect: (chapterId: string) => void;
}

const STATUS_CONFIG: Record<ChapterReviewStatus, { label: string; cls: string }> = {
  Pending_Review: { label: 'Chờ Review', cls: 'bg-amber-500/10 text-amber-400' },
  Revision: { label: 'Đang sửa lại', cls: 'bg-orange-500/10 text-orange-400' },
};

const FILTERS: { value: 'All' | ChapterReviewStatus; label: string }[] = [
  { value: 'All', label: 'Tất cả' },
  { value: 'Pending_Review', label: 'Chờ Review' },
  { value: 'Revision', label: 'Đang sửa lại' },
];

export const ReviewQueue = ({ onSelect }: ReviewQueueProps) => {
  const { data: queue = [], isLoading } = useReviewQueue();
  const [filter, setFilter] = useState<'All' | ChapterReviewStatus>('All');

  const filtered = useMemo(
    () => (filter === 'All' ? queue : queue.filter((c) => c.status === filter)),
    [queue, filter],
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <FileText size={20} className="text-brand" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary">Review bản thảo</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Soi lỗi QC, chốt số trang hợp lệ và duyệt giải ngân nhuận bút
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              filter === f.value
                ? 'bg-brand/10 text-brand border-brand/30'
                : 'bg-bg-secondary text-text-muted border-border-custom hover:text-text-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-brand" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
          <Inbox size={44} />
          <p className="text-sm">Không có chapter nào trong hàng đợi review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const status = STATUS_CONFIG[c.status];
            const deadline = getDeadlineStatus(c.deadline);
            return (
              <button
                key={c.chapterId}
                onClick={() => onSelect(c.chapterId)}
                className="group text-left bg-bg-secondary border border-border-custom rounded-xl p-4 hover:border-brand/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-[88px] rounded-lg overflow-hidden bg-bg-surface flex-shrink-0 border border-border-custom">
                    {c.coverUrl ? (
                      <img src={c.coverUrl} alt={c.seriesTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <FileText size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-text-muted group-hover:text-brand transition-colors flex-shrink-0"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mt-1.5 truncate">
                      {c.seriesTitle}
                    </h3>
                    <p className="text-xs text-text-secondary truncate">
                      Ch.{c.chapterNumber} · {c.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-text-muted">
                      <User size={11} />
                      <span className="truncate">{c.mangakaName}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border-custom/60">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <Layers size={12} className="text-brand/70" />
                    {c.pageCount} trang
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <Banknote size={12} className="text-success/70" />
                    {formatVND(c.genkouryoPrice)}/trang
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <Calendar size={12} />
                    {new Date(c.submittedAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-[11px] font-medium ${
                      deadline.isOverdue
                        ? 'text-danger'
                        : deadline.isUrgent
                          ? 'text-amber-400'
                          : 'text-text-muted'
                    }`}
                  >
                    {deadline.isOverdue || deadline.isUrgent ? (
                      <AlertTriangle size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    {deadline.isOverdue
                      ? `Trễ ${Math.abs(deadline.diffDays)}d`
                      : `Còn ${deadline.diffDays}d`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
