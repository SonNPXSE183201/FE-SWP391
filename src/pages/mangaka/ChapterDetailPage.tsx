import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Image, Filter,
  CheckCircle2, Clock, AlertTriangle, Loader2,
  ImagePlus,
} from 'lucide-react';

// ─── Import from features (Feature-Driven Architecture) ─────
import {
  MOCK_CHAPTERS,
  getPagesByChapterId,
  PAGE_STATUS_FILTER_OPTIONS,
  PageCard,
  PageLightbox,
} from '../../features/series';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import { CustomSelect } from '../../components/common/CustomSelect';

// ─── Main Page ───────────────────────────────────────────────
export const ChapterDetailPage = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Find chapter
  const chapter = useMemo(
    () => MOCK_CHAPTERS.find((c) => c.id === chapterId),
    [chapterId],
  );

  // Get pages for this chapter
  const allPages = useMemo(
    () => (chapterId ? getPagesByChapterId(chapterId) : []),
    [chapterId],
  );

  // Filter
  const filteredPages = useMemo(
    () => allPages.filter((p) => !statusFilter || p.status === statusFilter),
    [allPages, statusFilter],
  );

  const pagination = usePagination(filteredPages, { pageSize: 24 });

  useEffect(() => {
    pagination.goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: allPages.length,
    completed: allPages.filter((p) => p.status === 'Completed').length,
    inProgress: allPages.filter((p) => p.status === 'InProgress').length,
    pending: allPages.filter((p) => p.status === 'Pending').length,
    revision: allPages.filter((p) => p.status === 'NeedsRevision').length,
  }), [allPages]);

  if (!chapter) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 gap-4">
        <FileText size={48} className="text-text-muted" />
        <p className="text-text-secondary">Chapter không tồn tại</p>
        <button
          onClick={() => navigate('/mangaka/manuscripts')}
          className="text-sm text-brand hover:text-brand-hover transition-colors bg-transparent border-none cursor-pointer"
        >
          ← Quay lại Bản thảo
        </button>
      </div>
    );
  }

  const completionPercent = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/mangaka/manuscripts')}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand transition-colors bg-transparent border-none cursor-pointer w-fit"
        >
          <ArrowLeft size={14} />
          Quay lại Bản thảo
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center">
              <Image size={22} className="text-brand" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                Ch.{chapter.chapterNumber}: {chapter.title}
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                {chapter.seriesTitle} · {allPages.length} trang
              </p>
            </div>
          </div>

          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-all duration-200 border-none cursor-pointer shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5"
          >
            <ImagePlus size={16} />
            Upload thêm trang
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        {[
          { label: 'Tổng trang', value: stats.total, icon: FileText, color: 'text-brand', bgColor: 'bg-brand/10' },
          { label: 'Hoàn thành', value: stats.completed, icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/10' },
          { label: 'Đang làm', value: stats.inProgress, icon: Loader2, color: 'text-info', bgColor: 'bg-info/10' },
          { label: 'Chờ xử lý', value: stats.pending, icon: Clock, color: 'text-text-muted', bgColor: 'bg-bg-surface' },
          { label: 'Cần sửa', value: stats.revision, icon: AlertTriangle, color: 'text-warning', bgColor: 'bg-warning/10' },
        ].map(({ label, value, icon: Icon, color, bgColor }) => (
          <div key={label} className="bg-bg-secondary border border-border-custom rounded-xl p-3.5 flex items-center gap-3 hover:border-brand/20 transition-colors">
            <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center ${color}`}>
              <Icon size={16} />
            </div>
            <div>
              <div className="text-lg font-bold text-text-primary">{value}</div>
              <div className="text-[10px] text-text-muted">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-text-secondary">Tiến độ hoàn thành</span>
          <span className="text-xs font-bold text-brand">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand to-brand-hover rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mt-6">
        <div className="w-[170px]">
          <CustomSelect
            options={PAGE_STATUS_FILTER_OPTIONS.filter((o) => o.value !== '').map((o) => ({ value: o.value, label: o.label }))}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            placeholder="Tất cả trạng thái"
            icon={<Filter size={14} />}
            size="sm"
          />
        </div>
        <span className="text-xs text-text-muted ml-auto">
          {filteredPages.length} / {allPages.length} trang
        </span>
      </div>

      {/* Page Grid (Feature Components) */}
      {filteredPages.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mt-4">
          {pagination.paginatedData.map((page) => {
            const globalIdx = filteredPages.findIndex((p) => p.id === page.id);
            return (
              <PageCard
                key={page.id}
                page={page}
                onClick={() => setLightboxIndex(globalIdx)}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-8 bg-bg-secondary border border-border-custom rounded-xl p-12 flex flex-col items-center gap-4">
          <Image size={40} className="text-text-muted" />
          <p className="text-sm text-text-secondary">Không có trang nào phù hợp bộ lọc</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageRange={pagination.pageRange}
        totalItems={pagination.totalItems}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        canGoNext={pagination.canGoNext}
        canGoPrev={pagination.canGoPrev}
        onPageChange={pagination.goToPage}
        onNextPage={pagination.nextPage}
        onPrevPage={pagination.prevPage}
        itemLabel="trang"
      />

      {/* Lightbox (Feature Component) */}
      {lightboxIndex !== null && (
        <PageLightbox
          pages={filteredPages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  );
};
