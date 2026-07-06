import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Image, Filter,
  CheckCircle2, Clock, AlertTriangle, Loader2,
  ImagePlus,
  MapPin,
} from 'lucide-react';

import {
  PAGE_STATUS_FILTER_OPTIONS,
  PageCard,
  PageLightbox,
  AddPagesModal,
  ChapterSubmitPanel,
  useChapterDetail,
  useChapterPages,
  useChapterProductionReadiness,
  useSubmitChapterForReview,
  isChapterSubmittableStatus,
  useReplacePageImage,
  ReplacePageImageModal,
  getChapterStatusConfig,
  PAGE_STATUS_CONFIG,
} from '../index';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../../components/common/Pagination';
import { CustomSelect } from '../../../components/common/CustomSelect';
import type { PageDto } from '../../../api/generated/types';
import { reviewApi } from '../../review/api/review.api';
import { countPagesByStatus, normalizeChapterStatus, pageStatusMatchesFilter, toSelectFilterOptions } from '../../../utils/status';
import { MotionStagger, MotionItem } from '../../../components/common/animation';
import { motion } from 'framer-motion';

export const ChapterDetailFeature = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAddPages, setShowAddPages] = useState(false);
  const [replacePage, setReplacePage] = useState<PageDto | null>(null);

  const { data: chapter, isLoading: chapterLoading, error: chapterError } = useChapterDetail(chapterId);
  const { data: allPages = [], isLoading: pagesLoading, error: pagesError } = useChapterPages(chapterId);
  const { data: revisionAnnotations = [] } = useQuery({
    queryKey: ['chapter-revision-annotations', chapterId, allPages.map((p) => String(p.id)).join(',')],
    queryFn: async () => {
      if (!allPages.length) return [] as Array<{ id: string; pageId: string; pageNumber: number; comment: string; type: string }>;
      const byPage = await Promise.all(allPages.map(async (page) => {
        const pageId = String(page.id);
        const res = await reviewApi.listAnnotations({ pageId });
        const rows = res.data?.data ?? [];
        return rows.map((row) => ({
          id: String(row.id ?? ''),
          pageId: String(row.pageId ?? pageId),
          pageNumber: page.pageNumber ?? 0,
          comment: row.comment ?? '',
          type: row.type ?? 'Technical',
        }));
      }));
      return byPage.flat();
    },
    enabled: !!chapterId && allPages.length > 0,
    staleTime: 15_000,
  });

  const showSubmitPanel = chapter ? isChapterSubmittableStatus(chapter.status) : false;
  const isRevision = chapter ? normalizeChapterStatus(chapter.status) === 'Revision' : false;
  const {
    data: readiness,
    isLoading: readinessLoading,
    isError: readinessError,
    refetch: refetchReadiness,
  } = useChapterProductionReadiness(chapterId, showSubmitPanel);
  const submitForReview = useSubmitChapterForReview();
  const replacePageImage = useReplacePageImage(chapterId ?? '');

  const isLoading = chapterLoading || pagesLoading;
  const error = chapterError || pagesError;

  // Filter
  const filteredPages = useMemo(
    () => allPages.filter((p) => pageStatusMatchesFilter(p.status, statusFilter)),
    [allPages, statusFilter],
  );

  const pagination = usePagination(filteredPages, { pageSize: 24 });
  const annotationCountByPageId = useMemo(() => {
    const map = new Map<string, number>();
    revisionAnnotations.forEach((anno) => {
      map.set(anno.pageId, (map.get(anno.pageId) ?? 0) + 1);
    });
    return map;
  }, [revisionAnnotations]);

  useEffect(() => {
    pagination.goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Stats
  const stats = useMemo(() => countPagesByStatus(allPages), [allPages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">Không thể tải dữ liệu chương. Vui lòng thử lại.</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <FileText size={48} className="text-text-muted" />
        <p className="text-text-secondary">Chương không tồn tại</p>
        <button
          onClick={() => navigate('/mangaka/manuscripts')}
          className="text-sm text-brand hover:text-brand-hover transition-colors bg-transparent border-none cursor-pointer"
        >
          ← Quay lại Bản thảo
        </button>
      </motion.div>
    );
  }

  const completionPercent = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;
  const canReplacePageImage = isChapterSubmittableStatus(chapter.status);
  const chapterStatusCfg = getChapterStatusConfig(chapter.status);
  const ChapterStatusIcon = chapterStatusCfg.icon;

  return (
    <div>
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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 flex items-center justify-center shadow-sm">
              <Image size={24} className="text-brand" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                  {chapter.seriesTitle}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${chapterStatusCfg.bg} ${chapterStatusCfg.color}`}>
                  <ChapterStatusIcon size={12} strokeWidth={2.5} />
                  {chapterStatusCfg.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-text-primary flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-text-secondary/70 font-semibold">Chương {chapter.chapterNumber}:</span>
                <span className="text-text-primary">{chapter.title}</span>
              </h1>
              <div className="flex items-center gap-3 mt-1 text-xs font-medium text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Image size={13} />
                  {allPages.length} trang
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {showSubmitPanel && chapterId && (
              <ChapterSubmitPanel
                chapterId={chapterId}
                readiness={readiness}
                isLoading={readinessLoading}
                isError={readinessError}
                isSubmitting={submitForReview.isPending}
                onSubmit={() => submitForReview.mutate(chapterId)}
                variant="compact"
                chapterStatus={chapter.status}
                revisionAnnotations={revisionAnnotations}
              />
            )}
            <button
              onClick={() => navigate(`/mangaka/canvas/${chapterId}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bg-secondary hover:bg-bg-surface text-text-primary border border-brand/30 hover:border-brand rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              <Image size={16} className="text-brand" />
              Mở khung vẽ
            </button>
            <button
              onClick={() => setShowAddPages(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-all duration-200 border-none cursor-pointer shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5"
            >
              <ImagePlus size={16} />
              Tải thêm trang
            </button>
          </div>
        </div>
      </div>

      {showSubmitPanel && chapterId && (
        <div className="mt-6" id="chapter-submit-panel">
          <ChapterSubmitPanel
            chapterId={chapterId}
            readiness={readiness}
            isLoading={readinessLoading}
            isError={readinessError}
            isSubmitting={submitForReview.isPending}
            onSubmit={() => submitForReview.mutate(chapterId)}
            onRetry={() => void refetchReadiness()}
            chapterStatus={chapter.status}
            revisionAnnotations={revisionAnnotations}
          />
        </div>
      )}

      {/* Stats */}
      <MotionStagger className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        {[
          { label: 'Tổng trang', value: stats.total, icon: FileText, color: 'text-brand', bgColor: 'bg-brand/10' },
          { label: PAGE_STATUS_CONFIG.Completed.label, value: stats.completed, icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/10' },
          { label: PAGE_STATUS_CONFIG.InProgress.label, value: stats.inProgress, icon: Loader2, color: 'text-info', bgColor: 'bg-info/10' },
          { label: PAGE_STATUS_CONFIG.Pending.label, value: stats.pending, icon: Clock, color: 'text-text-muted', bgColor: 'bg-bg-surface' },
          { label: PAGE_STATUS_CONFIG.NeedsRevision.label, value: stats.revision, icon: AlertTriangle, color: 'text-warning', bgColor: 'bg-warning/10' },
        ].map(({ label, value, icon: Icon, color, bgColor }) => (
          <MotionItem key={label}>
          <div className="ui-card bg-bg-secondary border border-border-custom rounded-xl p-3.5 flex items-center gap-3 hover:border-brand/20 transition-colors h-full">
            <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center ${color}`}>
              <Icon size={16} />
            </div>
            <div>
              <div className="text-lg font-bold text-text-primary">{value}</div>
              <div className="text-[10px] text-text-muted">{label}</div>
            </div>
          </div>
          </MotionItem>
        ))}
      </MotionStagger>

      {/* Standalone annotation section — only show when NOT in revision mode (panel already has it) */}
      {!isRevision && revisionAnnotations.length > 0 && (
        <div className="mt-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-text-primary">Lỗi biên tập viên đã ghim</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300">
              {revisionAnnotations.length} lỗi
            </span>
          </div>
          <p className="text-[11px] text-text-muted mb-2">
            Bấm <span className="text-brand font-medium">Tải lại</span> trên thẻ trang để tải ảnh đã sửa,
            hoặc mở khung vẽ nếu cần giao trợ lý vẽ lại phần lỗi.
          </p>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {revisionAnnotations.slice(0, 8).map((anno) => (
              <div key={anno.id} className="text-xs text-text-secondary leading-relaxed">
                <span className="text-amber-300">• Trang {anno.pageNumber}:</span> {anno.comment}
              </div>
            ))}
            {revisionAnnotations.length > 8 && (
              <p className="text-[11px] text-text-muted">
                ... và {revisionAnnotations.length - 8} lỗi khác.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress bar — hide when revision (panel already has progress) */}
      {!isRevision && (
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
      )}

      {/* Filter bar */}
      <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="w-full sm:w-[190px]">
            <CustomSelect
              options={toSelectFilterOptions(PAGE_STATUS_FILTER_OPTIONS)}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              placeholder="Tất cả trạng thái"
              icon={<Filter size={14} />}
              size="sm"
            />
          </div>
          <span className="text-xs text-text-muted sm:ml-auto">
            Hiển thị {filteredPages.length} / {allPages.length} trang
          </span>
        </div>
      </div>
      {revisionAnnotations.length > 0 && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <MapPin size={12} className="text-amber-300" />
          <p className="text-[11px] text-amber-300">
            Các trang có lỗi sẽ có badge <span className="font-semibold">“x lỗi”</span> trên thẻ trang bên dưới.
          </p>
        </div>
      )}

      {/* Page Grid (Feature Components) */}
      {filteredPages.length > 0 ? (
        <MotionStagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 mt-4">
          {pagination.paginatedData.map((page) => {
            const globalIdx = filteredPages.findIndex((p) => p.id === page.id);
            const pageId = String(page.id);
            return (
              <MotionItem key={pageId}>
              <PageCard
                page={page}
                editorAnnotationCount={annotationCountByPageId.get(pageId) ?? 0}
                canReplaceImage={canReplacePageImage}
                onReplaceImage={() => setReplacePage(page)}
                onClick={() => setLightboxIndex(globalIdx)}
              />
              </MotionItem>
            );
          })}
        </MotionStagger>
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

      {/* Add pages modal */}
      {showAddPages && chapterId && (
        <AddPagesModal chapterId={chapterId} onClose={() => setShowAddPages(false)} />
      )}

      {replacePage && (
        <ReplacePageImageModal
          page={replacePage}
          isSubmitting={replacePageImage.isPending}
          onClose={() => setReplacePage(null)}
          onSubmit={(file) => {
            replacePageImage.mutate(
              { pageId: String(replacePage.id), file },
              { onSuccess: () => setReplacePage(null) },
            );
          }}
        />
      )}
    </div>
  );
};
