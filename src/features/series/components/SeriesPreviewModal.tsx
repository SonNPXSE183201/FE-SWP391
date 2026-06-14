import { createPortal } from 'react-dom';
import { Eye, X, ImagePlus, Banknote } from 'lucide-react';
import type { SeriesFormData } from '../types/series.types';
import { formatVND } from '../../wallet';

interface SeriesPreviewModalProps {
  formData: SeriesFormData;
  onClose: () => void;
}

export const SeriesPreviewModal = ({ formData, onClose }: SeriesPreviewModalProps) => {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl bg-bg-secondary border border-border-custom rounded-2xl shadow-2xl animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-brand" />
            <h2 className="text-sm font-semibold text-text-primary">Xem trước Series</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] text-amber-500 font-semibold">
              ● Draft
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-bg-surface hover:bg-danger/10 text-text-muted hover:text-danger flex items-center justify-center transition-colors border-none cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex gap-6">
            {/* Cover */}
            <div className="w-44 flex-shrink-0">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-bg-surface border border-border-custom">
                {formData.coverPreviewUrl ? (
                  <img src={formData.coverPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-muted">
                    <ImagePlus size={28} />
                    <span className="text-[10px]">Chưa có ảnh bìa</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Title */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Tiêu đề</p>
                <h3 className="text-xl font-bold text-text-primary leading-tight">
                  {formData.title || <span className="text-text-muted italic font-normal">Chưa nhập tiêu đề</span>}
                </h3>
              </div>

              {/* Synopsis */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Tóm tắt nội dung</p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {formData.synopsis || <span className="text-text-muted italic">Chưa nhập tóm tắt</span>}
                </p>
              </div>

              {/* Genres */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1.5">Thể loại</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.genre.length > 0
                    ? formData.genre.map((g) => (
                        <span key={g} className="px-2.5 py-1 rounded-lg bg-brand/10 text-brand text-[11px] font-medium border border-brand/15">
                          {g}
                        </span>
                      ))
                    : <span className="text-xs text-text-muted italic">Chưa chọn thể loại</span>
                  }
                </div>
              </div>

              {/* Budget Card */}
              <div className="bg-bg-surface border border-border-custom rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                    <Banknote size={16} className="text-brand" />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted">Vốn sản xuất Chapter 1</p>
                    <p className="text-sm font-semibold text-text-primary">
                      {formData.requestedBudget
                        ? formatVND(Number(formData.requestedBudget))
                        : <span className="text-text-muted italic font-normal">Chưa nhập</span>}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-text-muted">Chờ Board duyệt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border-custom flex items-center justify-between">
          <p className="text-[10px] text-text-muted">
            Sau khi tạo, bạn có thể upload bản phác thảo và submit xét duyệt.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-bg-surface border border-border-custom text-sm text-text-secondary hover:text-text-primary hover:border-brand/30 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
