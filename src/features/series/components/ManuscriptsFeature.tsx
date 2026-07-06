import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Clock,
  AlertCircle,
  BookOpen,
  Loader2,
  ChevronDown,
  Plus,
} from 'lucide-react';

import {
  SERIES_STATUS_FILTER_OPTIONS,
  getChapterStatusConfig,
  UploadChapterModal,
  useAllChapters,
  useMySeries,
  formatChapterDate,
} from '../index';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { seriesStatusMatchesFilter, toSelectFilterOptions } from '../../../utils/status';
import { getSeriesStatusConfig } from '../constants';
import type { ChapterWithSeriesTitle, NormalizedSeriesDto } from '../hooks/useSeries';
import { resolveSeriesCover } from '../utils/series.utils';

type SeriesGroup = NormalizedSeriesDto & { chapters: ChapterWithSeriesTitle[] };

export const ManuscriptsFeature = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedSeriesIds, setExpandedSeriesIds] = useState<Set<string>>(new Set());
  const [uploadSeriesId, setUploadSeriesId] = useState<string | undefined>();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: seriesList = [], isLoading: seriesLoading } = useMySeries({ pageSize: 100 });
  const { data: chapters = [], isLoading: chaptersLoading, error } = useAllChapters();

  const isLoading = seriesLoading || chaptersLoading;

  const seriesGroups = useMemo((): SeriesGroup[] => {
    const chaptersBySeries = new Map<string, ChapterWithSeriesTitle[]>();
    for (const chapter of chapters) {
      const seriesKey = String(chapter.seriesId ?? '');
      const list = chaptersBySeries.get(seriesKey) ?? [];
      list.push(chapter);
      chaptersBySeries.set(seriesKey, list);
    }

    return seriesList
      .filter((series) => !statusFilter || seriesStatusMatchesFilter(series.status, statusFilter))
      .map((series) => {
        const seriesKey = String(series.id ?? '');
        const seriesChapters = (chaptersBySeries.get(seriesKey) ?? [])
          .sort((a, b) => (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0));
        return { ...series, chapters: seriesChapters };
      });
  }, [seriesList, chapters, statusFilter]);

  const totalChapters = useMemo(
    () => seriesGroups.reduce((sum, g) => sum + g.chapters.length, 0),
    [seriesGroups],
  );

  const toggleSeries = useCallback((seriesId: string) => {
    setExpandedSeriesIds((prev) => {
      const next = new Set(prev);
      if (next.has(seriesId)) next.delete(seriesId);
      else next.add(seriesId);
      return next;
    });
  }, []);

  const openUploadModal = useCallback((seriesId?: string) => {
    setUploadSeriesId(seriesId);
    setShowUploadModal(true);
  }, []);

  const closeUploadModal = useCallback(() => {
    setShowUploadModal(false);
    setUploadSeriesId(undefined);
  }, []);

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
        <p className="text-text-muted">Không thể tải dữ liệu bản thảo. Vui lòng thử lại.</p>
      </div>
    );
  }

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
            <p className="text-xs text-text-muted mt-0.5">Tải lên và theo dõi các chương theo từng bộ truyện</p>
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <div className="w-[200px]">
          <CustomSelect
            options={toSelectFilterOptions(SERIES_STATUS_FILTER_OPTIONS)}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Tất cả trạng thái"
            size="sm"
          />
        </div>
        <span className="text-xs text-text-muted ml-auto">
          {seriesGroups.length} bộ truyện · {totalChapters} chương
        </span>
      </div>

      {/* Series accordion */}
      <div className="space-y-3 mt-5">
        {seriesGroups.map((group) => {
          const isExpanded = expandedSeriesIds.has(String(group.id));
          const seriesStatus = getSeriesStatusConfig(group.status);
          const coverUrl = resolveSeriesCover(group);

          return (
            <div
              key={group.id}
              className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => toggleSeries(String(group.id))}
                  className="flex flex-1 items-center gap-3 min-w-0 text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <ChevronDown
                    size={18}
                    className={`text-text-muted flex-shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-bg-surface border border-border-custom flex-shrink-0">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={group.title ?? ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={16} className="text-text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-text-primary truncate">
                        {group.title}
                      </h2>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${seriesStatus.bg} ${seriesStatus.color}`}
                      >
                        {seriesStatus.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {group.chapters.length} chương
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openUploadModal(String(group.id))}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-brand bg-brand/10 hover:bg-brand/15 border border-brand/20 cursor-pointer transition-colors flex-shrink-0"
                  title="Tạo chương nháp cho bộ truyện này"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Tạo chương</span>
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-border-custom bg-bg-primary/40 px-4 py-3 space-y-2">
                  {group.chapters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                      <FileText size={28} className="text-text-muted" />
                      <p className="text-xs text-text-muted">Chưa có chương nào trong bộ truyện này</p>
                      <button
                        type="button"
                        onClick={() => openUploadModal(String(group.id))}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-brand text-white border-none cursor-pointer hover:bg-brand-hover transition-colors"
                      >
                        <Upload size={14} />
                        Nộp chương đầu tiên
                      </button>
                    </div>
                  ) : (
                    group.chapters.map((chapter) => {
                      const statusCfg = getChapterStatusConfig(chapter.status);
                      const StatusIcon = statusCfg.icon;
                      const date = formatChapterDate(chapter);

                      return (
                        <div
                          key={String(chapter.id)}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/mangaka/manuscripts/${chapter.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              navigate(`/mangaka/manuscripts/${chapter.id}`);
                            }
                          }}
                          className="group flex items-center gap-3 rounded-xl border border-border-custom/60 bg-bg-secondary px-3 py-3 hover:border-brand/25 hover:bg-brand/[0.03] transition-all cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-lg bg-bg-surface flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-text-primary">
                              {String(chapter.chapterNumber).padStart(2, '0')}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-brand transition-colors">
                              Ch.{chapter.chapterNumber}: {chapter.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-muted">
                              <span>{chapter.validPageCount ?? 0} trang</span>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock size={10} />
                                {date}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${statusCfg.bg} ${statusCfg.color}`}
                          >
                            <StatusIcon size={11} />
                            {statusCfg.label}
                          </span>

                          {(chapter.status === 'Approved' || chapter.status === 'Published') && (
                            <div className="hidden sm:flex flex-col items-center flex-shrink-0 min-w-[36px]">
                              <span className="text-xs font-semibold text-success">
                                {chapter.validPageCount}
                              </span>
                              <span className="text-[9px] text-text-muted">Hợp lệ</span>
                            </div>
                          )}

                          {chapter.status === 'Revision' && (
                            <AlertCircle size={14} className="text-danger flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {seriesGroups.length === 0 && (
        <div className="mt-8 bg-bg-secondary border border-border-custom rounded-xl p-12 flex flex-col items-center gap-4">
          <BookOpen size={40} className="text-text-muted" />
          <p className="text-sm text-text-secondary">Không có bộ truyện hoặc chương phù hợp bộ lọc</p>
        </div>
      )}

      {showUploadModal && (
        <UploadChapterModal onClose={closeUploadModal} seriesId={uploadSeriesId} />
      )}
    </div>
  );
};
