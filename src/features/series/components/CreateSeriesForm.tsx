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
} from 'lucide-react';

import { useSeriesForm } from '../hooks/useSeriesForm';
import { GENRE_OPTIONS } from '../types/series.types';
import { SeriesPreviewModal } from './SeriesPreviewModal';

export const CreateSeriesForm = () => {
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
                border-2 border-dashed
                ${formData.coverPreviewUrl
                  ? 'border-transparent hover:border-brand/30'
                  : errors.coverImage
                    ? 'border-danger/30 hover:border-danger/50'
                    : 'border-border-custom hover:border-brand/30'
                }
              `}
            >
              {formData.coverPreviewUrl ? (
                <>
                  <img src={formData.coverPreviewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Upload size={14} className="text-white" />
                      <span className="text-white text-xs font-medium">Thay đổi</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-bg-surface flex flex-col items-center justify-center gap-3 text-text-muted group-hover:text-brand/70 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center">
                    <ImagePlus size={24} />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xs font-medium">Click để upload ảnh bìa</p>
                    <p className="text-[10px] mt-0.5 text-text-muted">PNG, JPG, WebP (tối đa 5MB)</p>
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
              <p className="text-[11px] text-danger mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-danger" />
                {errors.coverImage}
              </p>
            )}

            {formData.coverPreviewUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCoverImage(null as unknown as File);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-danger/5 hover:bg-danger/10 text-danger text-xs transition-colors border-none cursor-pointer"
              >
                <X size={12} />
                Xóa ảnh bìa
              </button>
            )}
          </div>
        </div>

        {/* ─── Right Column: Form Fields ─── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Tiêu đề Series <span className="text-danger">*</span></h2>
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="VD: Huyền Thoại Samurai"
              maxLength={100}
              className={`w-full px-4 py-3 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all ${
                errors.title ? 'border-danger/50 focus:border-danger focus:ring-1 focus:ring-danger/20' : 'border-border-custom focus:border-brand/50 focus:ring-1 focus:ring-brand/20'
              }`}
            />
            <div className="flex items-center justify-between mt-2">
              {errors.title
                ? <p className="text-[11px] text-danger flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-danger" />{errors.title}</p>
                : <span />
              }
              <span className="text-[10px] text-text-muted">{formData.title.length}/100</span>
            </div>
          </div>

          {/* Synopsis */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlignLeft size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Tóm tắt nội dung <span className="text-danger">*</span></h2>
            </div>
            <textarea
              value={formData.synopsis}
              onChange={(e) => updateField('synopsis', e.target.value)}
              placeholder="Mô tả ngắn gọn nội dung, bối cảnh và nhân vật chính của series..."
              rows={4}
              maxLength={500}
              className={`w-full px-4 py-3 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all resize-none ${
                errors.synopsis ? 'border-danger/50 focus:border-danger focus:ring-1 focus:ring-danger/20' : 'border-border-custom focus:border-brand/50 focus:ring-1 focus:ring-brand/20'
              }`}
            />
            <div className="flex items-center justify-between mt-2">
              {errors.synopsis
                ? <p className="text-[11px] text-danger flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-danger" />{errors.synopsis}</p>
                : <span />
              }
              <span className="text-[10px] text-text-muted">{formData.synopsis.length}/500</span>
            </div>
          </div>

          {/* Genre */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Tags size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Thể loại <span className="text-danger">*</span></h2>
            </div>
            <p className="text-xs text-text-muted mb-4">Chọn ít nhất 1 thể loại phù hợp</p>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => {
                const isSelected = formData.genre.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`
                      px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer
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
            {errors.genre && (
              <p className="text-[11px] text-danger mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-danger" />
                {errors.genre}
              </p>
            )}
          </div>

          {/* Budget */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Banknote size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Vốn sản xuất Chapter 1 <span className="text-danger">*</span></h2>
            </div>
            <p className="text-xs text-text-muted mb-4">
              Đề xuất ngân sách (Board sẽ quyết định số tiền thực tế khi duyệt)
            </p>
            <div className="relative">
              <input
                type="text"
                value={formatCurrency(formData.requestedBudget)}
                onChange={handleBudgetChange}
                placeholder="VD: 5,000,000"
                className={`w-full px-4 py-3 pr-16 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all ${
                  errors.requestedBudget ? 'border-danger/50 focus:border-danger focus:ring-1 focus:ring-danger/20' : 'border-border-custom focus:border-brand/50 focus:ring-1 focus:ring-brand/20'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted font-medium">VND</span>
            </div>
            {errors.requestedBudget && (
              <p className="text-[11px] text-danger mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-danger" />
                {errors.requestedBudget}
              </p>
            )}
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

      {/* ─── Preview Modal (Feature Component) ─── */}
      {showPreview && (
        <SeriesPreviewModal
          formData={formData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};
