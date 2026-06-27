import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
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
import { useReviewQueue, usePendingSeriesReview } from '../hooks/useReview';
import { formatVND, getDeadlineStatus } from '../constants';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import type { ChapterReviewStatus } from '../types';
import type { SeriesReviewDto } from '../api/review.api';

interface ReviewQueueProps {
  onSelect: (chapterId: string) => void;
}

const CHAPTER_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  Pending_Review: { label: 'Chờ duyệt', cls: 'bg-amber-500/10 text-amber-400' },
  Revision: { label: 'Đang sửa lại', cls: 'bg-orange-500/10 text-orange-400' },
  Approved: { label: 'Đã duyệt', cls: 'bg-success/10 text-success' },
  Draft: { label: 'Bản nháp', cls: 'bg-bg-surface text-text-muted' },
};

const SERIES_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  Pending_Approval: { label: 'Chờ duyệt Series', cls: 'bg-amber-500/10 text-amber-400' },
  Pending_Board_Vote: { label: 'Chờ Hội đồng', cls: 'bg-brand/10 text-brand' },
};

const CHAPTER_FILTERS: { value: 'All' | ChapterReviewStatus; label: string }[] = [
  { value: 'All', label: 'Tất cả' },
  { value: 'Pending_Review', label: 'Chờ duyệt' },
  { value: 'Revision', label: 'Đang sửa lại' },
];

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('vi-VN');
};

const parseGenres = (genre?: string | null) =>
  (genre ?? '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean)
    .slice(0, 3);

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

const SeriesReviewCard = ({ series }: { series: SeriesReviewDto }) => {
  const coverUrl = series.coverArtworkUrl ? resolveMediaUrl(series.coverArtworkUrl) : '';
  const status = SERIES_STATUS_CONFIG[series.status ?? ''] ?? {
    label: 'Chờ xử lý',
    cls: 'bg-amber-500/10 text-amber-400',
  };
  const genres = parseGenres(series.genre);

  return (
    <Link
      to={`/editor/review/${series.id}`}
      className="group flex gap-4 p-4 rounded-xl border border-border-custom bg-bg-primary/50 hover:border-brand/35 hover:bg-brand/[0.02] transition-all no-underline text-inherit"
    >
      <div className="w-[72px] h-[96px] rounded-lg overflow-hidden bg-bg-surface shrink-0 border border-border-custom">
        {coverUrl ? (
          <img src={coverUrl} alt={series.title || ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <BookOpen size={22} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.cls}`}>
            {status.label}
          </span>
          {series.estimatedProductionBudget != null && series.estimatedProductionBudget > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
              <Banknote size={11} />
              {formatVND(series.estimatedProductionBudget)}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-text-primary mt-1.5 truncate group-hover:text-brand transition-colors">
          {series.title}
        </h3>

        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-text-muted">
          <User size={11} />
          <span className="truncate">{series.mangakaName || 'Mangaka'}</span>
          <span className="text-text-muted/40">·</span>
          <Calendar size={11} />
          <span>{formatDate(series.createAt)}</span>
        </div>

        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {genres.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-md text-[10px] bg-bg-surface text-text-secondary border border-border-custom/60"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center shrink-0 self-center">
        <span className="hidden sm:inline text-xs text-text-muted group-hover:text-brand mr-1 transition-colors">
          Đánh giá
        </span>
        <ChevronRight size={18} className="text-text-muted group-hover:text-brand transition-colors" />
      </div>
    </Link>
  );
};

export const ReviewQueue = ({ onSelect }: ReviewQueueProps) => {
  const { data: queue = [], isLoading: chaptersLoading } = useReviewQueue();
  const { data: pendingSeries = [], isLoading: seriesLoading } = usePendingSeriesReview();
  const [chapterFilter, setChapterFilter] = useState<'All' | ChapterReviewStatus>('All');

  const filteredChapters = useMemo(
    () => (chapterFilter === 'All' ? queue : queue.filter((c) => c.status === chapterFilter)),
    [queue, chapterFilter],
  );

  const stats = useMemo(
    () => ({
      series: pendingSeries.length,
      chaptersPending: queue.filter((c) => c.status === 'Pending_Review').length,
      chaptersRevision: queue.filter((c) => c.status === 'Revision').length,
    }),
    [pendingSeries.length, queue],
  );

  const isInitialLoading = seriesLoading && chaptersLoading;

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[360px]">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  const allClear = pendingSeries.length === 0 && queue.length === 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <ClipboardCheck size={20} className="text-brand" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="page-header__title">Duyệt bản thảo</h1>
            <HelpTip
              content="Xử lý hồ sơ Series mới và chapter Mangaka đã nộp — trước khi chuyển Hội đồng hoặc giải ngân nhuận bút."
              title="Trang duyệt bản thảo"
              ariaLabel="Giải thích trang duyệt bản thảo"
              placement="bottom-start"
              width="20rem"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryStat
          label="Series chờ duyệt"
          value={stats.series}
          icon={BookOpen}
          tone="bg-amber-500/10 text-amber-400"
        />
        <SummaryStat
          label="Chapter chờ duyệt"
          value={stats.chaptersPending}
          icon={FileText}
          tone="bg-brand/10 text-brand"
        />
        <SummaryStat
          label="Chapter đang sửa lại"
          value={stats.chaptersRevision}
          icon={RotateCcw}
          tone="bg-orange-500/10 text-orange-400"
        />
      </div>

      {allClear ? (
        <EmptyBlock
          icon={CheckCircle2}
          title="Hàng đợi đang trống"
          description="Không có series hay chapter nào cần xử lý. Bạn sẽ nhận thông báo khi có hồ sơ mới."
        />
      ) : (
        <div className="space-y-6">
          <SectionShell
            icon={BookOpen}
            title="Hồ sơ Series mới"
            description="Mangaka gửi lần đầu: ảnh bìa, tóm tắt, bản phác thảo (Name) và ngân sách. Bạn đánh giá rồi trình Hội đồng hoặc yêu cầu chỉnh sửa."
            count={pendingSeries.length}
          >
            {seriesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-brand" size={24} />
              </div>
            ) : pendingSeries.length === 0 ? (
              <EmptyBlock
                icon={BookOpen}
                title="Không có series chờ duyệt"
                description="Mangaka chưa gửi hồ sơ mới hoặc bạn đã xử lý hết các series trong hàng đợi."
              />
            ) : (
              <div className="space-y-3">
                {pendingSeries.map((s) => (
                  <SeriesReviewCard key={s.id} series={s} />
                ))}
              </div>
            )}
          </SectionShell>

          <SectionShell
            icon={FileText}
            title="Chapter đã nộp"
            description="Sau khi Series được chấp nhận, Mangaka nộp từng chapter. Bạn kiểm tra lỗi, xác nhận số trang hợp lệ và duyệt nhuận bút."
            count={filteredChapters.length}
            action={
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted mr-1 hidden sm:inline">Lọc</span>
                {CHAPTER_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setChapterFilter(f.value)}
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
                title="Chưa có chapter nào"
                description={
                  chapterFilter === 'All'
                    ? 'Chapter sẽ hiện ở đây khi Mangaka nộp bản vẽ sau khi Series đã được duyệt.'
                    : 'Không có chapter nào trong trạng thái này. Thử chọn "Tất cả".'
                }
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filteredChapters.map((c) => {
                  const status = CHAPTER_STATUS_CONFIG[c.status || ''] || {
                    label: c.status,
                    cls: 'bg-bg-surface text-text-muted',
                  };
                  const deadline = getDeadlineStatus(c.submissionDeadline || new Date().toISOString());
                  const seriesTitle = c.series?.title || `Series #${c.seriesId}`;
                  const coverUrl = c.series?.coverImageUrl
                    ? resolveMediaUrl(c.series.coverImageUrl)
                    : '';
                  const mangakaName = c.series?.mangaka?.fullName || 'Mangaka';
                  const pageCount = c.pages?.length || c.validPageCount || 0;
                  const genkouryoPrice = c.appliedGenkouryoPrice || 0;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelect(String(c.id))}
                      className="group text-left rounded-xl border border-border-custom bg-bg-primary/50 p-4 hover:border-brand/35 hover:bg-brand/[0.02] transition-all cursor-pointer"
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
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.cls}`}>
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
                            Ch.{c.chapterNumber} · {c.title}
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
                  );
                })}
              </div>
            )}
          </SectionShell>
        </div>
      )}
    </div>
  );
};
