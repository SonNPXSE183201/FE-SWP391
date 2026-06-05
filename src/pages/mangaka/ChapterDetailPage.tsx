import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  ArrowLeft, FileText, Image, Upload, Filter,
  CheckCircle2, Clock, AlertTriangle, Loader2,
  ZoomIn, X, ChevronLeft, ChevronRight, Layers,
  ImagePlus,
} from 'lucide-react';
import type { Page, PageStatus } from '../../types/entities';
import { MOCK_CHAPTERS, getPagesByChapterId, PAGE_STATUS_CONFIG } from '../../features/series';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import { CustomSelect } from '../../components/common/CustomSelect';

// ─── Page Status Filter Options ──────────────────────────────
const PAGE_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'InProgress', label: 'Đang làm' },
  { value: 'Completed', label: 'Hoàn thành' },
  { value: 'NeedsRevision', label: 'Cần sửa' },
];

// ─── Page Placeholder Component ──────────────────────────────
const PagePlaceholder = ({ pageNumber }: { pageNumber: number }) => {
  const gradients = [
    'from-slate-800 to-slate-900',
    'from-zinc-800 to-zinc-900',
    'from-neutral-800 to-neutral-900',
    'from-gray-800 to-gray-900',
  ];
  const gradient = gradients[pageNumber % gradients.length];

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
      <FileText size={28} className="text-white/20" />
      <span className="text-white/30 text-xs font-medium">Trang {pageNumber}</span>
    </div>
  );
};

// ─── Lightbox Component ──────────────────────────────────────
const PageLightbox = ({
  pages,
  currentIndex,
  onClose,
  onNav,
}: {
  pages: Page[];
  currentIndex: number;
  onClose: () => void;
  onNav: (idx: number) => void;
}) => {
  const page = pages[currentIndex];
  const statusCfg = PAGE_STATUS_CONFIG[page.status];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNav(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < pages.length - 1) onNav(currentIndex + 1);
  }, [currentIndex, pages.length, onClose, onNav]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border-none cursor-pointer backdrop-blur-sm"
      >
        <X size={20} />
      </button>

      {/* Page info */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <span className="text-white/90 text-sm font-semibold bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          Trang {page.pageNumber} / {pages.length}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color} backdrop-blur-sm`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNav(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border-none cursor-pointer backdrop-blur-sm"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {currentIndex < pages.length - 1 && (
        <button
          onClick={() => onNav(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border-none cursor-pointer backdrop-blur-sm"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh] animate-fade-in">
        {page.imageUrl ? (
          <img
            src={page.imageUrl}
            alt={`Trang ${page.pageNumber}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <div className="w-[400px] h-[560px] rounded-lg overflow-hidden shadow-2xl">
            <PagePlaceholder pageNumber={page.pageNumber} />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ─── Page Card Component ─────────────────────────────────────
const PageCard = ({
  page,
  onClick,
}: {
  page: Page;
  onClick: () => void;
}) => {
  const statusCfg = PAGE_STATUS_CONFIG[page.status];

  return (
    <div
      onClick={onClick}
      className="group relative bg-bg-secondary border border-border-custom rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-brand/30 hover:shadow-md-custom hover:-translate-y-0.5"
    >
      {/* Image / Placeholder */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {page.imageUrl ? (
          <img
            src={page.imageUrl}
            alt={`Trang ${page.pageNumber}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PagePlaceholder pageNumber={page.pageNumber} />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <ZoomIn size={14} className="text-white" />
            <span className="text-white text-xs font-medium">Xem lớn</span>
          </div>
        </div>

        {/* Page number badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            P.{String(page.pageNumber).padStart(2, '0')}
          </span>
        </div>

        {/* Region count */}
        {page.regionCount > 0 && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 bg-brand/80 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
              <Layers size={10} />
              {page.regionCount}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 flex items-center justify-between">
        <span className="text-xs font-medium text-text-primary">
          Trang {page.pageNumber}
        </span>
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
          {statusCfg.label}
        </span>
      </div>
    </div>
  );
};

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

  // Lightbox handlers
  const openLightbox = (pageIndex: number) => setLightboxIndex(pageIndex);
  const closeLightbox = () => setLightboxIndex(null);

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
            options={PAGE_STATUS_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
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

      {/* Page Grid */}
      {filteredPages.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mt-4">
          {pagination.paginatedData.map((page) => {
            const globalIdx = filteredPages.findIndex((p) => p.id === page.id);
            return (
              <PageCard
                key={page.id}
                page={page}
                onClick={() => openLightbox(globalIdx)}
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

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PageLightbox
          pages={filteredPages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNav={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  );
};
