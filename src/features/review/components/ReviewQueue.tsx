import { useMemo, useState, type ReactNode } from 'react';
import {
  FileText,
  Loader2,
  User,
  Calendar,
  Layers,
  Banknote,
  AlertTriangle,
  Clock,
  ChevronRight,
  Inbox,
  BookOpen,
  ClipboardCheck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import {
  MotionStagger,
  MotionItem,
  MotionListItem,
  containerVariants,
} from '../../../components/common/animation';
import { motion } from 'framer-motion';
import { useReviewQueue } from '../hooks/useReview';
import { formatVND, getDeadlineStatus } from '../constants';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import {
  EDITOR_CHAPTER_REVIEW_FILTER_OPTIONS,
  getChapterStatusConfig,
} from '../../series';
import { chapterStatusMatchesFilter, normalizeChapterStatus } from '../../../utils/status';
import type { ChapterReviewStatus } from '../types';

interface ReviewQueueProps {
  onSelect: (chapterId: string) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('vi-VN');
};


const SummaryStat = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof BookOpen;
  tone: string;
}) => (
  <div className="bg-bg-secondary border border-border-custom rounded-xl px-4 py-3 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg ${tone} flex items-center justify-center shrink-0`}>
      <Icon size={17} />
    </div>
    <div>
      <p className="text-lg font-bold text-text-primary leading-none">{value}</p>
      <p className="text-[11px] text-text-muted mt-1">{label}</p>
    </div>
  </div>
);

const SectionShell = ({
  icon: Icon,
  title,
  description,
  count,
  children,
  action,
}: {
  icon: typeof BookOpen;
  title: string;
  description?: string;
  count: number;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <section className="bg-bg-secondary border border-border-custom rounded-xl">
    <div className="px-5 py-4 border-b border-border-custom flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={16} className="text-brand shrink-0" />
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {description && (
          <HelpTip
            content={description}
            ariaLabel={`Giải thích: ${title}`}
            placement="bottom-start"
          />
        )}
        <span className="text-[10px] font-semibold text-text-muted bg-bg-surface px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const EmptyBlock = ({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Inbox;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-border-custom bg-bg-primary/40">
    <div className="w-12 h-12 rounded-xl bg-bg-surface flex items-center justify-center mb-3">
      <Icon size={22} className="text-text-muted" />
    </div>
    <p className="text-sm font-medium text-text-primary">{title}</p>
    <p className="text-xs text-text-muted mt-1 max-w-sm">{description}</p>
  </div>
);



export const ReviewQueue = ({ onSelect }: ReviewQueueProps) => {
  const { data: queue = [], isLoading: chaptersLoading } = useReviewQueue();
  const [chapterFilter, setChapterFilter] = useState<'' | ChapterReviewStatus>('');

  const filteredChapters = useMemo(
    () => queue.filter((c) => chapterStatusMatchesFilter(c.status, chapterFilter)),
    [queue, chapterFilter],
  );

  const stats = useMemo(
    () => ({
      chaptersPending: queue.filter((c) => normalizeChapterStatus(c.status) === 'UnderReview').length,
      chaptersRevision: queue.filter((c) => normalizeChapterStatus(c.status) === 'Revision').length,
    }),
    [queue],
  );

  const isInitialLoading = chaptersLoading;

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[360px]">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  const allClear = queue.length === 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <ClipboardCheck size={20} className="text-brand" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="page-header__title">Biên tập chương</h1>
            <HelpTip
              content="Xử lý chương Tác giả đã nộp — trước khi giải ngân nhuận bút."
              title="Biên tập chương"
              ariaLabel="Giải thích trang biên tập chương"
              placement="bottom-start"
              width="20rem"
            />
          </div>
        </div>
      </div>

      <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MotionItem>
        <SummaryStat
          label="Chương chờ biên tập"
          value={stats.chaptersPending}
          icon={FileText}
          tone="bg-brand/10 text-brand"
        />
        </MotionItem>
        <MotionItem>
        <SummaryStat
          label="Chương yêu cầu sửa"
          value={stats.chaptersRevision}
          icon={RotateCcw}
          tone="bg-orange-500/10 text-orange-400"
        />
        </MotionItem>
      </MotionStagger>

      {allClear ? (
        <EmptyBlock
          icon={CheckCircle2}
          title="Hàng đợi đang trống"
          description="Không có chương nào cần xử lý. Bạn sẽ nhận thông báo khi có chương mới nộp."
        />
      ) : (
        <div className="space-y-6">

          <SectionShell
            icon={FileText}
            title="Chương đã nộp"
            description="Sau khi bộ truyện được chấp nhận, Tác giả nộp từng chương. Bạn kiểm tra lỗi, xác nhận số trang hợp lệ và duyệt nhuận bút."
            count={filteredChapters.length}
            action={
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted mr-1 hidden sm:inline">Lọc</span>
                {EDITOR_CHAPTER_REVIEW_FILTER_OPTIONS.map((f) => (
                  <button
                    key={f.value || 'all'}
                    type="button"
                    onClick={() => setChapterFilter(f.value as '' | ChapterReviewStatus)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                      chapterFilter === f.value
                        ? 'bg-brand/10 text-brand border-brand/30'
                        : 'bg-bg-primary text-text-muted border-border-custom hover:text-text-secondary'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            }
          >
            {chaptersLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-brand" size={24} />
              </div>
            ) : filteredChapters.length === 0 ? (
              <EmptyBlock
                icon={Inbox}
                title="Chưa có chương nào"
                description={
                  !chapterFilter
                    ? 'Chương sẽ hiện ở đây khi Tác giả nộp bản vẽ sau khi bộ truyện đã được duyệt.'
                    : 'Không có chương nào trong trạng thái này. Thử chọn "Tất cả".'
                }
              />
            ) : (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-3"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {filteredChapters.map((c) => {
                  const status = getChapterStatusConfig(c.status);
                  const deadline = getDeadlineStatus(c.submissionDeadline || new Date().toISOString());
                  const seriesTitle = c.series?.title || `Bộ truyện #${c.seriesId}`;
                  const coverUrl = c.series?.coverImageUrl
                    ? resolveMediaUrl(c.series.coverImageUrl)
                    : '';
                  const mangakaName = c.series?.mangaka?.fullName || 'Tác giả';
                  const pageCount = c.pages?.length || c.validPageCount || 0;
                  const genkouryoPrice = c.appliedGenkouryoPrice || 0;

                  return (
                    <MotionListItem key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(String(c.id))}
                      className="group w-full text-left rounded-xl border border-border-custom bg-bg-primary/50 p-4 hover:border-brand/35 hover:bg-brand/[0.02] transition-all cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <div className="w-14 h-[72px] rounded-lg overflow-hidden bg-bg-surface shrink-0 border border-border-custom">
                          {coverUrl ? (
                            <img src={coverUrl} alt={seriesTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <FileText size={18} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                            <ChevronRight
                              size={16}
                              className="text-text-muted group-hover:text-brand transition-colors shrink-0"
                            />
                          </div>
                          <h3 className="text-sm font-semibold text-text-primary mt-1 truncate group-hover:text-brand transition-colors">
                            {seriesTitle}
                          </h3>
                          <p className="text-xs text-text-secondary truncate">
                            Chương {c.chapterNumber} · {c.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-text-muted">
                            <User size={11} />
                            <span className="truncate">{mangakaName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border-custom/60">
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                          <Layers size={12} className="text-brand/70" />
                          {pageCount} trang
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                          <Banknote size={12} className="text-success/70" />
                          {formatVND(genkouryoPrice)}/trang
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                          <Calendar size={12} />
                          {formatDate(c.createAt)}
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
                            ? `Trễ ${Math.abs(deadline.diffDays)} ngày`
                            : `Còn ${deadline.diffDays} ngày`}
                        </div>
                      </div>
                    </button>
                    </MotionListItem>
                  );
                })}
              </motion.div>
            )}
          </SectionShell>
        </div>
      )}
    </div>
  );
};
