import { useState, useRef, useCallback } from 'react';
import { AnimatedModal } from '../../../components/common/animation';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X, ImagePlus, CheckCircle2 } from 'lucide-react';
import { seriesApi } from '../api/series.api';
import { isApiSuccess, getAxiosErrorMessage } from '../../../api/axios';
import type { ApiResponse, PageDto } from '../../../api/generated/types';

interface AddPagesModalProps {
  chapterId: string;
  onClose: () => void;
}

export const AddPagesModal = ({ chapterId, onClose }: AddPagesModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [pages, setPages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Vui lòng chọn tệp ảnh');
      return;
    }
    setPages((prev) => [...prev, ...imageFiles]);
    setPreviews((prev) => [...prev, ...imageFiles.map((f) => URL.createObjectURL(f))]);
  };

  const removePage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(async () => {
    if (pages.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 trang để tải lên');
      return;
    }

    setUploading(true);
    try {
      const res = await seriesApi.addChapterPages(chapterId, pages);
      const apiData = res.data as ApiResponse<PageDto[]>;

      if (isApiSuccess(apiData)) {
        toast.success(`Đã thêm ${pages.length} trang vào chương`, {
          icon: <CheckCircle2 size={18} className="text-success" />,
          duration: 4000,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['pages', chapterId] }),
          queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] }),
          queryClient.invalidateQueries({ queryKey: ['canvas', 'pages', chapterId] }),
        ]);
        onClose();
      } else {
        toast.error(apiData.message || 'Thêm trang thất bại');
      }
    } catch (err) {
      toast.error(getAxiosErrorMessage(err, 'Tải lên thất bại. Vui lòng thử lại.'));
    } finally {
      setUploading(false);
    }
  }, [chapterId, pages, queryClient, onClose]);

  const totalSizeMB = (pages.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1);

  return (
    <AnimatedModal
      open
      onClose={onClose}
      panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-lg-custom"
    >
        <div className="sticky top-0 z-10 bg-bg-secondary border-b border-border-custom px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <ImagePlus size={18} className="text-brand" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Tải thêm trang</h2>
              <p className="text-[11px] text-text-muted">Bổ sung trang ảnh vào chương hiện tại</p>
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
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Trang bản thảo <span className="text-danger">*</span>
              <span className="text-text-muted font-normal ml-1">
                ({pages.length} trang đã chọn{pages.length > 0 ? ` - ${totalSizeMB} MB` : ''})
              </span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-custom hover:border-brand/40 rounded-xl p-6 text-center cursor-pointer transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-bg-surface flex items-center justify-center mx-auto group-hover:bg-brand/10 transition-colors">
                <ImagePlus size={20} className="text-text-muted group-hover:text-brand transition-colors" />
              </div>
              <p className="text-xs text-text-secondary mt-2 font-medium">Nhấn để chọn hoặc kéo thả</p>
              <p className="text-[10px] text-text-muted mt-0.5">PNG, JPG, WebP - có thể chọn nhiều tệp</p>
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

          {previews.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2">Xem trước các trang:</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[200px] overflow-y-auto pr-1">
                {previews.map((url, i) => (
                  <div key={i} className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-border-custom">
                    <img src={url} alt={`Trang ${i + 1}`} className="w-full h-full object-cover" />
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
            disabled={uploading || pages.length === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
              uploading || pages.length === 0
                ? 'bg-brand/50 text-white/70 cursor-not-allowed'
                : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover'
            }`}
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload size={14} />
                Thêm trang
              </>
            )}
          </button>
        </div>
    </AnimatedModal>
  );
};
