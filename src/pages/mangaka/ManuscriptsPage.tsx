import { useState, useRef, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FileText, Upload, Clock, CheckCircle2, AlertCircle, Eye, RotateCcw, ImagePlus, X, BookOpen } from 'lucide-react';
import type { Chapter, ChapterStatus } from '../../types/entities';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';
import { CustomSelect } from '../../components/common/CustomSelect';

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_CHAPTERS: (Chapter & { seriesTitle: string })[] = [
  {
    id: 'ch-1', seriesId: 's-1', seriesTitle: 'Huyền Thoại Samurai',
    chapterNumber: 1, title: 'Khởi đầu - Thanh kiếm gỉ sét',
    status: 'Published', pageCount: 24, validPageCount: 24,
    submittedAt: '2026-04-20T10:00:00Z', approvedAt: '2026-04-22T10:00:00Z',
    createdAt: '2026-04-18T08:00:00Z', updatedAt: '2026-04-22T10:00:00Z',
  },
  {
    id: 'ch-2', seriesId: 's-1', seriesTitle: 'Huyền Thoại Samurai',
    chapterNumber: 2, title: 'Cuộc gặp gỡ định mệnh',
    status: 'Published', pageCount: 22, validPageCount: 22,
    submittedAt: '2026-05-01T10:00:00Z', approvedAt: '2026-05-03T10:00:00Z',
    createdAt: '2026-04-28T08:00:00Z', updatedAt: '2026-05-03T10:00:00Z',
  },
  {
    id: 'ch-3', seriesId: 's-1', seriesTitle: 'Huyền Thoại Samurai',
    chapterNumber: 3, title: 'Bí mật của ngôi làng',
    status: 'Approved', pageCount: 26, validPageCount: 26,
    submittedAt: '2026-05-15T10:00:00Z', approvedAt: '2026-05-17T10:00:00Z',
    createdAt: '2026-05-12T08:00:00Z', updatedAt: '2026-05-17T10:00:00Z',
  },
  {
    id: 'ch-4', seriesId: 's-1', seriesTitle: 'Huyền Thoại Samurai',
    chapterNumber: 4, title: 'Trận chiến đầu tiên',
    status: 'UnderReview', pageCount: 28, validPageCount: 0,
    submittedAt: '2026-06-01T10:00:00Z',
    createdAt: '2026-05-28T08:00:00Z', updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'ch-5', seriesId: 's-2', seriesTitle: 'Lạc Giữa Ngân Hà',
    chapterNumber: 1, title: 'Tín hiệu cuối cùng',
    status: 'Revision', pageCount: 20, validPageCount: 18,
    submittedAt: '2026-05-20T10:00:00Z',
    createdAt: '2026-05-18T08:00:00Z', updatedAt: '2026-05-25T10:00:00Z',
  },
  {
    id: 'ch-6', seriesId: 's-3', seriesTitle: 'Vườn Hoa Mùa Đông',
    chapterNumber: 1, title: 'Ngày đầu tiên',
    status: 'Draft', pageCount: 18, validPageCount: 0,
    createdAt: '2026-06-01T08:00:00Z', updatedAt: '2026-06-03T10:00:00Z',
  },
];

// ─── Status Config ───────────────────────────────────────────
const CHAPTER_STATUS_CONFIG: Record<ChapterStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  Draft: { label: 'Bản nháp', color: 'text-text-secondary', bg: 'bg-bg-surface', icon: FileText },
  Submitted: { label: 'Đã nộp', color: 'text-info', bg: 'bg-info/10', icon: Upload },
  UnderReview: { label: 'Đang review', color: 'text-warning', bg: 'bg-warning/10', icon: Eye },
  Approved: { label: 'Đã duyệt', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  Revision: { label: 'Yêu cầu sửa', color: 'text-danger', bg: 'bg-danger/10', icon: RotateCcw },
  Published: { label: 'Đã xuất bản', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
};

// ─── Upload Modal ────────────────────────────────────────────
const UploadChapterModal = ({ onClose }: { onClose: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [pages, setPages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    setPages((prev) => [...prev, ...imageFiles]);
    const newPreviews = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !chapterNum || pages.length === 0) {
      toast.error('Vui lòng điền đầy đủ thông tin và upload ít nhất 1 trang');
      return;
    }
    setUploading(true);
    try {
      // TODO: Replace with real API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`Đã nộp Chapter ${chapterNum}: ${title} (${pages.length} trang)`);
      onClose();
    } catch {
      toast.error('Upload thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-lg-custom animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-secondary border-b border-border-custom px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <Upload size={18} className="text-brand" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Nộp bản thảo Chapter</h2>
              <p className="text-[11px] text-text-muted">Upload các trang bản thảo (Name)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Chapter info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Số Chapter <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={chapterNum}
                onChange={(e) => setChapterNum(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Tiêu đề Chapter <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Khởi đầu - Thanh kiếm gỉ sét"
                className="w-full px-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>
          </div>

          {/* Upload area */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Trang bản thảo <span className="text-danger">*</span>
              <span className="text-text-muted font-normal ml-1">({pages.length} trang đã chọn)</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-custom hover:border-brand/40 rounded-xl p-6 text-center cursor-pointer transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-bg-surface flex items-center justify-center mx-auto group-hover:bg-brand/10 transition-colors">
                <ImagePlus size={20} className="text-text-muted group-hover:text-brand transition-colors" />
              </div>
              <p className="text-xs text-text-secondary mt-2 font-medium">Click để chọn hoặc kéo thả</p>
              <p className="text-[10px] text-text-muted mt-0.5">PNG, JPG, WebP — có thể chọn nhiều file</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />
          </div>

          {/* Page previews */}
          {previews.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2">Xem trước các trang:</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[200px] overflow-y-auto pr-1">
                {previews.map((url, i) => (
                  <div key={i} className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-border-custom">
                    <img src={url} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removePage(i)}
                        className="w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center border-none cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-medium">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bg-secondary border-t border-border-custom px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
              uploading
                ? 'bg-brand/50 text-white/70 cursor-not-allowed'
                : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover'
            }`}
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang upload...
              </>
            ) : (
              <>
                <Upload size={14} />
                Nộp bản thảo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────
export const ManuscriptsPage = () => {
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
            options={[
              { value: 'Draft', label: 'Bản nháp' },
              { value: 'Submitted', label: 'Đã nộp' },
              { value: 'UnderReview', label: 'Đang review' },
              { value: 'Approved', label: 'Đã duyệt' },
              { value: 'Revision', label: 'Yêu cầu sửa' },
              { value: 'Published', label: 'Đã xuất bản' },
            ]}
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

      {/* Upload Modal */}
      {showUploadModal && <UploadChapterModal onClose={() => setShowUploadModal(false)} />}
    </div>
  );
};
