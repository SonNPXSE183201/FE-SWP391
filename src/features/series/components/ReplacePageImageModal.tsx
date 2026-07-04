import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X, ImagePlus } from 'lucide-react';
import type { PageDto } from '../../../api/generated/types';

interface ReplacePageImageModalProps {
  page: Pick<PageDto, 'pageNumber'> & { id?: string | number };
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
}

export const ReplacePageImageModal = ({
  page,
  isSubmitting,
  onClose,
  onSubmit,
}: ReplacePageImageModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected?.type.startsWith('image/')) {
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = useCallback(() => {
    if (!file) return;
    onSubmit(file);
  }, [file, onSubmit]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-lg shadow-lg-custom animate-modal-enter">
        <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <ImagePlus size={18} className="text-brand" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Tải lại ảnh · Trang {page.pageNumber}
              </h2>
              <p className="text-[11px] text-text-muted">Thay ảnh đã sửa cho trang hiện tại</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Chọn file ảnh đã chỉnh sửa để thay thế trang này. Vùng Canvas chưa giao task sẽ được xóa tự động.
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border-custom hover:border-brand/40 rounded-xl p-6 text-center cursor-pointer transition-colors group"
          >
            {preview ? (
              <img
                src={preview}
                alt={`Trang ${page.pageNumber} mới`}
                className="mx-auto max-h-48 rounded-lg object-contain"
              />
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg bg-bg-surface flex items-center justify-center mx-auto group-hover:bg-brand/10 transition-colors">
                  <ImagePlus size={20} className="text-text-muted group-hover:text-brand transition-colors" />
                </div>
                <p className="text-xs text-text-secondary mt-2 font-medium">Click để chọn ảnh đã sửa</p>
                <p className="text-[10px] text-text-muted mt-0.5">PNG, JPG, WebP</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="px-6 py-4 border-t border-border-custom flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !file}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
              isSubmitting || !file
                ? 'bg-brand/50 text-white/70 cursor-not-allowed'
                : 'bg-brand hover:bg-brand-hover text-white shadow-brand'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload size={14} />
                Tải lại ảnh
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
