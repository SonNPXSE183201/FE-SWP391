import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  Eye,
  FileText,
  Clock,
  TrendingUp,
} from 'lucide-react';
import type { Series, SeriesStatus } from '../../types/entities';

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_SERIES: Series[] = [
  {
    id: '1',
    title: 'Huyền Thoại Samurai',
    synopsis: 'Câu chuyện về một samurai trẻ tuổi bước vào hành trình tìm kiếm sức mạnh thực sự giữa thời loạn.',
    genre: ['Shōnen', 'Action', 'Historical'],
    coverImageUrl: '',
    mangakaId: 'mk-1',
    mangakaName: 'Phúc Phạm',
    status: 'Published',
    chapterCount: 12,
    createdAt: '2026-04-15T08:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'Lạc Giữa Ngân Hà',
    synopsis: 'Hành trình của một phi hành gia mất liên lạc, trôi dạt giữa vũ trụ rộng lớn với những bí ẩn chưa được khám phá.',
    genre: ['Sci-Fi', 'Mystery'],
    coverImageUrl: '',
    mangakaId: 'mk-1',
    mangakaName: 'Phúc Phạm',
    status: 'Approved',
    chapterCount: 5,
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-28T10:00:00Z',
  },
  {
    id: '3',
    title: 'Vườn Hoa Mùa Đông',
    synopsis: 'Chuyện tình lãng mạn giữa hai người làm vườn trong một ngôi làng nhỏ bên bờ biển, nơi mùa đông kéo dài.',
    genre: ['Romance', 'Slice of Life', 'Josei'],
    coverImageUrl: '',
    mangakaId: 'mk-1',
    mangakaName: 'Phúc Phạm',
    status: 'PendingApproval',
    chapterCount: 3,
    createdAt: '2026-05-20T08:00:00Z',
    updatedAt: '2026-06-02T10:00:00Z',
  },
  {
    id: '4',
    title: 'Bóng Ma Học Đường',
    synopsis: 'Một nhóm học sinh phát hiện trường học của mình ẩn chứa những bí mật kinh hoàng từ 50 năm trước.',
    genre: ['Horror', 'Mystery', 'Shōnen'],
    coverImageUrl: '',
    mangakaId: 'mk-1',
    mangakaName: 'Phúc Phạm',
    status: 'Draft',
    chapterCount: 1,
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-03T10:00:00Z',
  },
  {
    id: '5',
    title: 'Kiếm Sĩ Vô Danh',
    synopsis: 'Câu chuyện về một kiếm sĩ lang thang không tên, tìm kiếm ý nghĩa của cuộc sống giữa thời bình.',
    genre: ['Seinen', 'Action', 'Fantasy'],
    coverImageUrl: '',
    mangakaId: 'mk-1',
    mangakaName: 'Phúc Phạm',
    status: 'OnHold',
    chapterCount: 8,
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-04-20T10:00:00Z',
  },
  {
    id: '6',
    title: 'Đảo Kho Báu X',
    synopsis: 'Hải tặc, kho báu, và những cuộc phiêu lưu ngoài khơi. Ai sẽ tìm được kho báu truyền thuyết?',
    genre: ['Shōnen', 'Fantasy', 'Comedy'],
    coverImageUrl: '',
    mangakaId: 'mk-1',
    mangakaName: 'Phúc Phạm',
    status: 'Cancelled',
    chapterCount: 2,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
  },
];

// ─── Status Config ───────────────────────────────────────────
const STATUS_CONFIG: Record<SeriesStatus, { label: string; color: string; bg: string }> = {
  Draft: { label: 'Bản nháp', color: 'text-text-secondary', bg: 'bg-bg-surface' },
  PendingApproval: { label: 'Chờ duyệt', color: 'text-warning', bg: 'bg-warning/10' },
  Approved: { label: 'Đã duyệt', color: 'text-info', bg: 'bg-info/10' },
  Published: { label: 'Đang xuất bản', color: 'text-success', bg: 'bg-success/10' },
  OnHold: { label: 'Tạm dừng', color: 'text-text-muted', bg: 'bg-bg-surface' },
  Cancelled: { label: 'Đã hủy', color: 'text-danger', bg: 'bg-danger/10' },
};

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Draft', label: 'Bản nháp' },
  { value: 'PendingApproval', label: 'Chờ duyệt' },
  { value: 'Approved', label: 'Đã duyệt' },
  { value: 'Published', label: 'Đang xuất bản' },
  { value: 'OnHold', label: 'Tạm dừng' },
  { value: 'Cancelled', label: 'Đã hủy' },
];

// ─── Cover Placeholder ──────────────────────────────────────
const CoverPlaceholder = ({ title, index }: { title: string; index: number }) => {
  const gradients = [
    'from-brand/30 to-secondary/30',
    'from-info/30 to-brand/30',
    'from-success/30 to-info/30',
    'from-warning/30 to-danger/30',
    'from-secondary/30 to-success/30',
    'from-danger/30 to-warning/30',
  ];
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center`}>
      <span className="text-3xl font-bold text-white/40 select-none">
        {title.charAt(0)}
      </span>
    </div>
  );
};

// ─── Series Card Component ──────────────────────────────────
const SeriesCard = ({ series, index, onClick }: { series: Series; index: number; onClick: () => void }) => {
  const status = STATUS_CONFIG[series.status];
  const updatedDate = new Date(series.updatedAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className="group bg-bg-secondary border border-border-custom rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-brand/30 hover:shadow-md-custom hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {series.coverImageUrl ? (
          <img src={series.coverImageUrl} alt={series.title} className="w-full h-full object-cover" />
        ) : (
          <CoverPlaceholder title={series.title} index={index} />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent opacity-80" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.color} backdrop-blur-sm`}>
            {status.label}
          </span>
        </div>

        {/* Chapter count */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-[11px] text-white/80 font-medium">
            <FileText size={12} />
            {series.chapterCount} chương
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors duration-200 line-clamp-1">
          {series.title}
        </h3>
        <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
          {series.synopsis}
        </p>

        {/* Genre tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {series.genre.slice(0, 3).map((g) => (
            <span
              key={g}
              className="px-2 py-0.5 rounded-md bg-brand/8 text-brand/80 text-[10px] font-medium border border-brand/10"
            >
              {g}
            </span>
          ))}
          {series.genre.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-bg-surface text-text-muted text-[10px] font-medium">
              +{series.genre.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border-custom">
          <Clock size={12} className="text-text-muted" />
          <span className="text-[11px] text-text-muted">Cập nhật {updatedDate}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Series Row Component (List view) ───────────────────────
const SeriesRow = ({ series, index, onClick }: { series: Series; index: number; onClick: () => void }) => {
  const status = STATUS_CONFIG[series.status];
  const updatedDate = new Date(series.updatedAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 bg-bg-secondary border border-border-custom rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-brand/30 hover:bg-bg-surface/50"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Thumbnail */}
      <div className="w-14 h-[72px] rounded-lg overflow-hidden flex-shrink-0">
        {series.coverImageUrl ? (
          <img src={series.coverImageUrl} alt={series.title} className="w-full h-full object-cover" />
        ) : (
          <CoverPlaceholder title={series.title} index={index} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors truncate">
            {series.title}
          </h3>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.color} flex-shrink-0`}>
            {status.label}
          </span>
        </div>
        <p className="text-xs text-text-muted mt-1 line-clamp-1">{series.synopsis}</p>
        <div className="flex items-center gap-3 mt-2">
          {series.genre.slice(0, 3).map((g) => (
            <span key={g} className="text-[10px] text-brand/70 font-medium">{g}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 flex-shrink-0">
        <div className="text-center">
          <div className="text-sm font-semibold text-text-primary">{series.chapterCount}</div>
          <div className="text-[10px] text-text-muted">Chương</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-text-muted">{updatedDate}</div>
          <div className="text-[10px] text-text-muted">Cập nhật</div>
        </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        <button className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand/10 transition-colors">
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Page Component ─────────────────────────────────────
export const SeriesListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter + Search logic
  const filteredSeries = useMemo(() => {
    return MOCK_SERIES.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = !statusFilter || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: MOCK_SERIES.length,
    published: MOCK_SERIES.filter((s) => s.status === 'Published').length,
    pending: MOCK_SERIES.filter((s) => s.status === 'PendingApproval').length,
    totalChapters: MOCK_SERIES.reduce((sum, s) => sum + s.chapterCount, 0),
  }), []);

  return (
    <div className="animate-fade-in">
      {/* ─── Header ─── */}
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

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {[
          { label: 'Tổng Series', value: stats.total, icon: BookOpen, color: 'text-brand' },
          { label: 'Đang xuất bản', value: stats.published, icon: TrendingUp, color: 'text-success' },
          { label: 'Chờ duyệt', value: stats.pending, icon: Clock, color: 'text-warning' },
          { label: 'Tổng Chapters', value: stats.totalChapters, icon: FileText, color: 'text-info' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-bg-secondary border border-border-custom rounded-xl p-4 flex items-center gap-3 hover:border-brand/20 transition-colors"
          >
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

      {/* ─── Search & Filters Bar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm series, thể loại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-8 pr-8 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand/50 cursor-pointer min-w-[160px]"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:text-text-primary'}`}
            title="Xem dạng lưới"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:text-text-primary'}`}
            title="Xem dạng danh sách"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* ─── Results count ─── */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-text-muted">
          Hiển thị <span className="text-text-primary font-medium">{filteredSeries.length}</span> / {MOCK_SERIES.length} series
        </p>
        {(searchQuery || statusFilter) && (
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
            className="text-xs text-brand hover:text-brand-hover transition-colors cursor-pointer bg-transparent border-none"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* ─── Series Grid / List ─── */}
      {filteredSeries.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {filteredSeries.map((series, i) => (
              <SeriesCard
                key={series.id}
                series={series}
                index={i}
                onClick={() => navigate(`/mangaka/series/${series.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {filteredSeries.map((series, i) => (
              <SeriesRow
                key={series.id}
                series={series}
                index={i}
                onClick={() => navigate(`/mangaka/series/${series.id}`)}
              />
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
    </div>
  );
};
