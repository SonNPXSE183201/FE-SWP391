import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X, ImagePlus, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { seriesApi } from '../api/series.api';
import { useMySeries } from '../hooks/useSeries';
import { isApiSuccess, getAxiosErrorMessage } from '../../../api/axios';
import type { ApiResponse, ChapterDto } from '../../../api/generated/types';

interface UploadChapterModalProps {
  onClose: () => void;
  /** Optional — pre-select a series (e.g. from SeriesDetail page) */
  seriesId?: string;
}

export const UploadChapterModal = ({ onClose, seriesId: preselectedSeriesId }: UploadChapterModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [selectedSeriesId, setSelectedSeriesId] = useState(preselectedSeriesId ?? '');
  const [title, setTitle] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [pages, setPages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch series list for the selector dropdown
  const { data: seriesList = [], isLoading: seriesLoading } = useMySeries({ pageSize: 100 });

  // Only show series that are in production-eligible statuses
  const eligibleSeries = seriesList.filter(
    (s) => s.status === 'Draft' || s.status === 'PendingApproval' || s.status === 'Approved' || s.status === 'Published',
  );

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
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previews[index]);
    setPages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(async () => {
    if (!selectedSeriesId) {
      toast.error('Vui lòng chọn Series');
      return;
    }
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề Chapter');
      return;
    }
    if (!chapterNum || parseInt(chapterNum) < 1) {
      toast.error('Số Chapter phải lớn hơn 0');
      return;
    }
    if (pages.length === 0) {
      toast.error('Vui lòng upload ít nhất 1 trang bản thảo');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Build the request using the existing seriesApi.submitChapter
      const res = await seriesApi.submitChapter(selectedSeriesId, {
        chapterNumber: parseInt(chapterNum),
        title: title.trim(),
        pages,
      });

      const apiData = res.data as ApiResponse<ChapterDto>;

      if (isApiSuccess(apiData)) {
        toast.success(
          `Đã tạo Chapter ${chapterNum}: ${title} (${pages.length} trang). Tiếp theo: Canvas → giao task → nộp Editor.`,
          { icon: <CheckCircle2 size={18} className="text-success" />, duration: 5000 },
        );

        // Invalidate React Query caches so lists refresh automatically
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['chapters', 'all'] }),
          queryClient.invalidateQueries({ queryKey: ['chapters', selectedSeriesId] }),
          queryClient.invalidateQueries({ queryKey: ['series'] }),
        ]);

        onClose();
      } else {
        toast.error(apiData.message || 'Tạo chapter thất bại');
      }
    } catch (err) {
      const msg = getAxiosErrorMessage(err, 'Upload thất bại. Vui lòng thử lại.');
      toast.error(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [selectedSeriesId, title, chapterNum, pages, queryClient, onClose]);

  // Compute total file size for display
  const totalSizeMB = (pages.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-lg-custom animate-modal-enter">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-secondary border-b border-border-custom px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <Upload size={18} className="text-brand" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Tạo Chapter nháp</h2>
              <p className="text-[11px] text-text-muted">Upload trang phác thảo — sau đó sản xuất trên Canvas rồi nộp Editor</p>
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
          {/* Series selector — only show if no preselected seriesId */}
          {!preselectedSeriesId && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Series <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <select
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  disabled={seriesLoading}
                  className="w-full pl-9 pr-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">
                    {seriesLoading ? 'Đang tải...' : '— Chọn Series —'}
                  </option>
                  {eligibleSeries.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              {eligibleSeries.length === 0 && !seriesLoading && (
                <p className="text-[11px] text-warning mt-1 flex items-center gap-1">
                  <AlertCircle size={11} />
                  Không có Series nào khả dụng. Hãy tạo Series trước.
                </p>
              )}
            </div>
          )}

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
              <span className="text-text-muted font-normal ml-1">({pages.length} trang đã chọn{pages.length > 0 ? ` — ${totalSizeMB} MB` : ''})</span>
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

          {/* Upload progress bar */}
          {uploading && uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted">Đang upload...</span>
                <span className="text-brand font-medium">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bg-secondary border-t border-border-custom px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !selectedSeriesId}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
              uploading || !selectedSeriesId
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
                Tạo chapter nháp
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
