import { Link } from 'react-router-dom';
import {
  BookOpen,
  Loader2,
  User,
  Calendar,
  Banknote,
  ChevronRight,
  Inbox,
  CheckCircle2,
} from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import { usePendingSeriesReview } from '../hooks/useReview';
import { formatVND } from '../constants';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { getSeriesStatusConfig, getGenreLabel } from '../../series';
import type { SeriesReviewDto } from '../api/review.api';
import { MotionStagger, MotionItem, MotionListItem, containerVariants } from '../../../components/common/animation';
import { motion } from 'framer-motion';

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
  const status = getSeriesStatusConfig(series.status);
  const genres = parseGenres(series.genre);

  return (
    <Link
      to={`/editor/review/${series.id}`}
      className="group ui-card-interactive flex gap-4 p-4 rounded-xl border border-border-custom bg-bg-primary/50 hover:border-brand/35 hover:bg-brand/[0.02] no-underline text-inherit"
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
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
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
          <span className="truncate">{series.mangakaName || 'Tác giả'}</span>
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
                {getGenreLabel(g)}
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

export const SeriesReviewQueueFeature = () => {
  const { data: pendingSeries = [], isLoading: seriesLoading } = usePendingSeriesReview();

  if (seriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[360px]">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  const allClear = pendingSeries.length === 0;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <BookOpen size={20} className="text-brand" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="page-header__title">Thẩm định dự án</h1>
            <HelpTip
              content="Xử lý hồ sơ Dự án mới mà Tác giả đã nộp — đánh giá chất lượng và trình Hội đồng xuất bản."
              title="Thẩm định dự án"
              ariaLabel="Giải thích trang thẩm định dự án"
              placement="bottom-start"
              width="20rem"
            />
          </div>
        </div>
      </div>

      <MotionStagger className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MotionItem>
        <SummaryStat
          label="Dự án chờ duyệt"
          value={pendingSeries.length}
          icon={BookOpen}
          tone="bg-amber-500/10 text-amber-400"
        />
        </MotionItem>
      </MotionStagger>

      {allClear ? (
        <EmptyBlock
          icon={CheckCircle2}
          title="Không có hồ sơ mới"
          description="Tác giả chưa gửi hồ sơ mới hoặc bạn đã xử lý hết các bộ truyện trong hàng đợi."
        />
      ) : (
        <section className="bg-bg-secondary border border-border-custom rounded-xl p-5">
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {pendingSeries.map((s) => (
              <MotionListItem key={s.id}>
                <SeriesReviewCard series={s} />
              </MotionListItem>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
};
