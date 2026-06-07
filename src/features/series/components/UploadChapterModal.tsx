import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { Upload, X, ImagePlus } from 'lucide-react';

interface UploadChapterModalProps {
  onClose: () => void;
}

export const UploadChapterModal = ({ onClose }: UploadChapterModalProps) => {
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
    </div>,
    document.body,
  );
};
