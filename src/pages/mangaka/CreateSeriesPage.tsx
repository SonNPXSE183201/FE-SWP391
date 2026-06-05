import { useState, useRef } from 'react';
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
  FileText,
} from 'lucide-react';
import { useSeriesForm, GENRE_OPTIONS } from '../../features/series';

export const CreateSeriesPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameFileInputRef = useRef<HTMLInputElement>(null);
  const {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    handleCoverImage,
    handleNameFile,
    toggleGenre,
    validate,
    reset,
  } = useSeriesForm();

  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with real API call
      // await seriesApi.create({ title, synopsis, genre, coverImage });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Tạo Series thành công!');
      navigate('/mangaka/series');
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

  // Handle Name (storyboard) PDF file
  const handleNameFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File phác thảo không được vượt quá 20MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        toast.error('Vui lòng chọn file PDF');
        return;
      }
      handleNameFile(file);
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
    <div className="animate-fade-in max-w-4xl mx-auto">
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
          <p className="text-xs text-text-muted mt-0.5">Điền thông tin cơ bản cho series manga của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-brand/30 transition-all cursor-pointer"
          >
            <Eye size={14} />
            Xem trước
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column: Cover Image ─── */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Ảnh bìa</h2>
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
          {/* Title */}
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

          {/* ─── Finance & Schedule Section ─── */}
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

              {/* Name (Storyboard) PDF Upload */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  <FileText size={12} className="inline mr-1" />
                  Bản phác thảo (Name)
                </label>
                <div
                  onClick={() => nameFileInputRef.current?.click()}
                  className={`
                    relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300
                    border-2 border-dashed bg-bg-surface
                    ${formData.nameFile
                      ? 'border-brand/30 hover:border-brand/50'
                      : errors.nameFile
                        ? 'border-danger/50 hover:border-danger/70'
                        : 'border-border-custom hover:border-brand/30'
                    }
                  `}
                >
                  {formData.nameFile ? (
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {formData.nameFileName}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          {formData.nameFile && `${(formData.nameFile.size / (1024 * 1024)).toFixed(2)} MB`}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNameFile(null);
                        }}
                        className="w-7 h-7 rounded-full bg-danger/10 hover:bg-danger/20 text-danger flex items-center justify-center transition-colors border-none cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-6 flex flex-col items-center justify-center gap-2 text-text-muted group-hover:text-brand/70 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center">
                        <Upload size={18} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">Kéo thả hoặc click để upload file PDF</p>
                        <p className="text-[10px] mt-0.5 text-text-muted">Chỉ chấp nhận PDF (tối đa 20MB)</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={nameFileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleNameFileChange}
                  className="hidden"
                />
                {errors.nameFile && (
                  <p className="text-xs text-danger mt-1">{errors.nameFile}</p>
                )}
              </div>
            </div>
          </div>

          {/* ─── Preview Card ─── */}
          {showPreview && (
            <div className="bg-bg-secondary border border-brand/20 rounded-xl p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Xem trước</h2>
              </div>
              <div className="flex gap-4">
                <div className="w-24 h-32 rounded-lg overflow-hidden bg-bg-surface flex-shrink-0">
                  {formData.coverPreviewUrl ? (
                    <img src={formData.coverPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <ImagePlus size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-text-primary">
                    {formData.title || 'Tiêu đề series'}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">
                    {formData.synopsis || 'Tóm tắt nội dung sẽ hiển thị ở đây...'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.genre.length > 0
                      ? formData.genre.map((g) => (
                          <span key={g} className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium">
                            {g}
                          </span>
                        ))
                      : <span className="text-[10px] text-text-muted italic">Chưa chọn thể loại</span>
                    }
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-bg-surface text-[10px] text-text-muted font-medium">
                      Bản nháp
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              onClick={handleSubmit}
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
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Tạo Series
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
