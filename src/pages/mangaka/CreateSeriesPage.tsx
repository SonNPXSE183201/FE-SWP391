import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Upload,
  X,
  ImagePlus,
  BookOpen,
  AlignLeft,
  Tags,
  Sparkles,
  Save,
  Eye,
  Banknote,
} from 'lucide-react';
import { useSeriesForm, GENRE_OPTIONS } from '../../features/series';

export const CreateSeriesPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    handleCoverImage,
    toggleGenre,
    validate,
    reset,
  } = useSeriesForm();

  const [showPreview, setShowPreview] = useState(false);

  // Create Series → saves with status "Draft"
  const handleCreateSeries = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with real API call — response will contain the new seriesId
      // const { data } = await seriesApi.create({ ...formData, status: 'Draft' });
      // navigate(`/mangaka/series/${data.id}`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Tạo Series thành công! Trạng thái: Bản nháp (Draft)');
      // Mock: navigate to series ID '4' (Bóng Ma Học Đường — Draft status)
      navigate('/mangaka/series/4');
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ảnh bìa không được vượt quá 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }
      handleCoverImage(file);
    }
  };

  // Currency formatting helpers
  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(numericValue));
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    updateField('requestedBudget', raw);
  };

  return (
    <div className="animate-fade-in">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/mangaka/series')}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary">Tạo Series mới</h1>
          <p className="text-xs text-text-muted mt-0.5">Điền thông tin hồ sơ cho series manga của bạn</p>
        </div>
      </div>

      {/* ─── Draft Workflow Info ─── */}
      <div className="mb-6 px-4 py-3 bg-brand/5 border border-brand/15 rounded-xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Save size={16} className="text-brand" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Quy trình tạo Series</p>
          <p className="text-xs text-text-muted mt-0.5">
            Series được lưu ở trạng thái <strong className="text-amber-500">Bản nháp (Draft)</strong>. 
            Sau khi tạo, bạn có thể upload bản phác thảo (Name) và submit xét duyệt trên trang chi tiết Series.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column: Cover Image ─── */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Ảnh bìa <span className="text-danger">*</span></h2>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group transition-all duration-300
                ${formData.coverPreviewUrl
                  ? 'border-2 border-transparent hover:border-brand/40'
                  : 'border-2 border-dashed border-border-custom hover:border-brand/40 bg-bg-surface'
                }
                ${errors.coverImage ? 'border-danger/50' : ''}
              `}
            >
              {formData.coverPreviewUrl ? (
                <>
                  <img
                    src={formData.coverPreviewUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Thay đổi ảnh</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCoverImage(null);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-danger/80 hover:bg-danger text-white flex items-center justify-center transition-colors border-none cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-text-muted group-hover:text-brand/70 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xs font-medium">Kéo thả hoặc click để upload</p>
                    <p className="text-[10px] mt-1 text-text-muted">PNG, JPG, WebP (tối đa 5MB)</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {errors.coverImage && (
              <p className="text-xs text-danger mt-2">{errors.coverImage}</p>
            )}
            <p className="text-[10px] text-text-muted mt-3 text-center">
              Tỷ lệ khuyến nghị: 3:4 (750×1000px)
            </p>
          </div>
        </div>

        {/* ─── Right Column: Form ─── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title & Synopsis */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Thông tin cơ bản</h2>
            </div>

            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Tiêu đề Series <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="VD: Huyền Thoại Samurai"
                  className={`w-full px-4 py-2.5 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-all ${
                    errors.title
                      ? 'border-danger/50 focus:border-danger focus:ring-danger/20'
                      : 'border-border-custom focus:border-brand/50 focus:ring-brand/20'
                  }`}
                  maxLength={100}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.title && <p className="text-xs text-danger">{errors.title}</p>}
                  <p className="text-[10px] text-text-muted ml-auto">{formData.title.length}/100</p>
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  <AlignLeft size={12} className="inline mr-1" />
                  Tóm tắt nội dung <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.synopsis}
                  onChange={(e) => updateField('synopsis', e.target.value)}
                  placeholder="Mô tả ngắn gọn về series manga của bạn..."
                  rows={4}
                  className={`w-full px-4 py-3 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-all resize-none ${
                    errors.synopsis
                      ? 'border-danger/50 focus:border-danger focus:ring-danger/20'
                      : 'border-border-custom focus:border-brand/50 focus:ring-brand/20'
                  }`}
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.synopsis && <p className="text-xs text-danger">{errors.synopsis}</p>}
                  <p className="text-[10px] text-text-muted ml-auto">{formData.synopsis.length}/500</p>
                </div>
              </div>
            </div>
          </div>

          {/* Genre Selection */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tags size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">
                Thể loại <span className="text-danger">*</span>
              </h2>
              <span className="text-[10px] text-text-muted ml-auto">
                Đã chọn: {formData.genre.length}
              </span>
            </div>
            {errors.genre && <p className="text-xs text-danger mb-3">{errors.genre}</p>}
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => {
                const isSelected = formData.genre.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer
                      ${isSelected
                        ? 'bg-brand/15 text-brand border-brand/30 shadow-sm'
                        : 'bg-bg-surface text-text-secondary border-border-custom hover:border-brand/20 hover:text-text-primary'
                      }
                    `}
                  >
                    {isSelected && <Sparkles size={10} className="inline mr-1" />}
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Finance Section ─── */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Banknote size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">
                Tài chính & Tiến độ
              </h2>
            </div>

            <div className="space-y-4">
              {/* Requested Budget */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Vốn sản xuất Chapter 1 (VNĐ) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.requestedBudget ? formatCurrency(formData.requestedBudget) : ''}
                    onChange={handleBudgetChange}
                    placeholder="VD: 1,000,000"
                    className={`w-full px-4 py-2.5 pr-14 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 transition-all ${
                      errors.requestedBudget
                        ? 'border-danger/50 focus:border-danger focus:ring-danger/20'
                        : 'border-border-custom focus:border-brand/50 focus:ring-brand/20'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">
                    VNĐ
                  </span>
                </div>
                {errors.requestedBudget && (
                  <p className="text-xs text-danger mt-1">{errors.requestedBudget}</p>
                )}
                <p className="text-[10px] text-text-muted mt-1.5">
                  Số tiền đề xuất cho Board duyệt. Board có quyền điều chỉnh.
                </p>
              </div>
            </div>
          </div>



          {/* ─── Action Buttons ─── */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { reset(); navigate('/mangaka/series'); }}
              className="px-5 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-border-custom transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-brand/30 transition-all cursor-pointer"
            >
              <Eye size={16} />
              Xem trước
            </button>
            <button
              type="button"
              onClick={handleCreateSeries}
              disabled={isSubmitting}
              className={`
                inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all duration-200
                ${isSubmitting
                  ? 'bg-brand/50 text-white/70 cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Lưu nháp
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Preview Modal (Portal) ─── */}
      {showPreview && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowPreview(false); }}
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
                onClick={() => setShowPreview(false)}
                className="w-8 h-8 rounded-lg bg-bg-surface hover:bg-danger/10 text-text-muted hover:text-danger flex items-center justify-center transition-colors border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex gap-6">
                {/* Cover — larger */}
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

                {/* Info — detailed */}
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
                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(formData.requestedBudget))
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
                onClick={() => setShowPreview(false)}
                className="px-5 py-2 rounded-xl bg-bg-surface border border-border-custom text-sm text-text-secondary hover:text-text-primary hover:border-brand/30 transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};
