import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, Search, Filter, LayoutGrid, List,
  FileText, Clock, TrendingUp,
} from 'lucide-react';
import {

  SERIES_STATUS_FILTER_OPTIONS,
  SeriesCard,
  SeriesRow,
} from '../index';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../../components/common/Pagination';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { useSeriesList } from '../hooks/useSeries';
export const SeriesListFeature = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: series = [], isLoading, isError } = useSeriesList();

  const filteredSeries = useMemo(() => {
    return series.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = !statusFilter || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const pagination = usePagination(filteredSeries, { pageSize: 8 });

  useEffect(() => {
    pagination.goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: series.length,
    published: series.filter((s) => s.status === 'Published').length,
    pending: series.filter((s) => s.status === 'PendingApproval').length,
    totalChapters: series.reduce((sum, s) => sum + s.chapterCount, 0),
  }), [series]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <BookOpen size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Series của tôi</h1>
            <p className="text-xs text-text-muted mt-0.5">Quản lý toàn bộ series manga</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/mangaka/series/create')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-all duration-200 border-none cursor-pointer shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={16} />
          Tạo Series mới
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {[
          { label: 'Tổng Series', value: stats.total, icon: BookOpen, color: 'text-brand' },
          { label: 'Đang xuất bản', value: stats.published, icon: TrendingUp, color: 'text-success' },
          { label: 'Chờ duyệt', value: stats.pending, icon: Clock, color: 'text-warning' },
          { label: 'Tổng Chapters', value: stats.totalChapters, icon: FileText, color: 'text-info' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-bg-secondary border border-border-custom rounded-xl p-4 flex items-center gap-3 hover:border-brand/20 transition-colors">
            <div className={`w-9 h-9 rounded-lg bg-bg-surface flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <div className="text-lg font-bold text-text-primary">{value}</div>
              <div className="text-[11px] text-text-muted">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text" placeholder="Tìm kiếm series, thể loại..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
          />
        </div>
        <div className="w-[170px]">
          <CustomSelect
            options={SERIES_STATUS_FILTER_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            placeholder="Tất cả trạng thái"
            icon={<Filter size={14} />}
            size="sm"
          />
        </div>
        <div className="flex items-center bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
          <button onClick={() => setViewMode('grid')}
            className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:text-text-primary'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')}
            className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:text-text-primary'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-text-muted">
          Tìm thấy <span className="text-text-primary font-medium">{filteredSeries.length}</span> / {series.length} series
        </p>
        {(searchQuery || statusFilter) && (
          <button onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
            className="text-xs text-brand hover:text-brand-hover transition-colors cursor-pointer bg-transparent border-none">
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Series Grid / List — using feature components */}
      {filteredSeries.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {pagination.paginatedData.map((series, i) => (
              <SeriesCard key={series.id} series={series} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {pagination.paginatedData.map((series, i) => (
              <SeriesRow key={series.id} series={series} index={i} />
            ))}
          </div>
        )
      ) : (
        <div className="mt-8 bg-bg-secondary border border-border-custom rounded-xl p-12 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-bg-surface flex items-center justify-center">
            <Search size={28} className="text-text-muted" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">Không tìm thấy series</p>
            <p className="text-xs text-text-muted mt-1">Thử thay đổi từ khóa hoặc bộ lọc</p>
          </div>
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
        itemLabel="series"
      />
    </div>
  );
};
