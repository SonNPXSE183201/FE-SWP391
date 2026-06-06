import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Clock, AlertCircle, BookOpen } from 'lucide-react';

import {
  MOCK_CHAPTERS,
  CHAPTER_STATUS_CONFIG,
  CHAPTER_STATUS_FILTER_OPTIONS,
  UploadChapterModal,
} from '../index';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../../components/common/Pagination';
import { CustomSelect } from '../../../components/common/CustomSelect';

export const ManuscriptsFeature = () => {
  const navigate = useNavigate();
  const [seriesFilter, setSeriesFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const seriesFilterOptions = [...new Set(MOCK_CHAPTERS.map((c) => c.seriesTitle))];

  const filtered = useMemo(() => MOCK_CHAPTERS.filter((c) => {
    const matchesSeries = !seriesFilter || c.seriesTitle === seriesFilter;
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSeries && matchesStatus;
  }), [seriesFilter, statusFilter]);

  const pagination = usePagination(filtered, { pageSize: 10 });

  useEffect(() => {
    pagination.goToPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesFilter, statusFilter]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <FileText size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Quản lý bản thảo</h1>
            <p className="text-xs text-text-muted mt-0.5">Upload và theo dõi trạng thái chapters</p>
          </div>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-all duration-200 border-none cursor-pointer shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5"
        >
          <Upload size={16} />
          Nộp bản thảo mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <div className="w-[180px]">
          <CustomSelect
            options={seriesFilterOptions.map((s) => ({ value: s, label: s }))}
            value={seriesFilter}
            onChange={(v) => setSeriesFilter(v)}
            placeholder="Tất cả Series"
            icon={<BookOpen size={14} />}
            size="sm"
          />
        </div>

        <div className="w-[180px]">
          <CustomSelect
            options={CHAPTER_STATUS_FILTER_OPTIONS.filter((o) => o.value !== '').map((o) => ({ value: o.value, label: o.label }))}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            placeholder="Tất cả trạng thái"
            size="sm"
          />
        </div>

        <span className="text-xs text-text-muted ml-auto">
          {filtered.length} chapters
        </span>
      </div>

      {/* Chapter List */}
      <div className="space-y-3 mt-5">
        {pagination.paginatedData.map((chapter) => {
          const statusCfg = CHAPTER_STATUS_CONFIG[chapter.status];
          const StatusIcon = statusCfg.icon;
          const date = chapter.submittedAt
            ? new Date(chapter.submittedAt).toLocaleDateString('vi-VN')
            : new Date(chapter.createdAt).toLocaleDateString('vi-VN');

          return (
            <div
              key={chapter.id}
              onClick={() => navigate(`/mangaka/manuscripts/${chapter.id}`)}
              className="group flex items-center gap-4 bg-bg-secondary border border-border-custom rounded-xl p-4 hover:border-brand/20 transition-all cursor-pointer"
            >
              {/* Chapter number */}
              <div className="w-11 h-11 rounded-xl bg-bg-surface flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-text-primary">
                  {String(chapter.chapterNumber).padStart(2, '0')}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
                    Ch.{chapter.chapterNumber}: {chapter.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-text-muted">{chapter.seriesTitle}</span>
                  <span className="text-text-muted">·</span>
                  <span className="text-[11px] text-text-muted">{chapter.pageCount} trang</span>
                  <span className="text-text-muted">·</span>
                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                    <Clock size={10} />
                    {date}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                  <StatusIcon size={12} />
                  {statusCfg.label}
                </span>
              </div>

              {/* Valid pages indicator */}
              {chapter.status === 'Approved' || chapter.status === 'Published' ? (
                <div className="hidden sm:flex flex-col items-center flex-shrink-0">
                  <span className="text-xs font-semibold text-success">{chapter.validPageCount}</span>
                  <span className="text-[9px] text-text-muted">Hợp lệ</span>
                </div>
              ) : chapter.status === 'Revision' ? (
                <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                  <AlertCircle size={14} className="text-danger" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 bg-bg-secondary border border-border-custom rounded-xl p-12 flex flex-col items-center gap-4">
          <FileText size={40} className="text-text-muted" />
          <p className="text-sm text-text-secondary">Không có chapter nào</p>
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
        itemLabel="chapters"
      />

      {/* Upload Modal (Feature Component) */}
      {showUploadModal && <UploadChapterModal onClose={() => setShowUploadModal(false)} />}
    </div>
  );
};
