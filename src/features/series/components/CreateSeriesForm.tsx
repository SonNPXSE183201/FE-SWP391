import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Upload,
  X,
  ImagePlus,
  BookOpen,
  Save,
  Eye,
  FileText,
  ChevronRight,
  ListChecks,
} from 'lucide-react';

import { useSeriesForm } from '../hooks/useSeriesForm';
import { HelpTip } from '../../../components/common/HelpTip';
import { GenrePicker } from './GenrePicker';
import {
  CREATE_SERIES_WORKFLOW_HELP,
  NEMU_BUDGET_HELP,
  NEMU_BUDGET_LABEL,
  NEMU_MANUSCRIPT_LABEL,
  CREATE_SERIES_DRAFT_NOTE,
  BUDGET_BOARD_SUBTITLE,
  SERIES_DRAFT_STATUS_LABEL,
  COVER_UPLOAD_LABEL,
} from '../constants/seriesCopy';
import { SeriesPreviewModal } from './SeriesPreviewModal';
import { seriesApi } from '../api/series.api';
import type { ApiResponse } from '../../../api/axios';
import type { SeriesDto } from '../../../api/generated/types';
import { formatVND } from '../../wallet/constants';
import { formatVNDInput } from '../../../utils/currency';

const QUICK_BUDGETS = [
  { label: '5M', value: 5_000_000 },
  { label: '10M', value: 10_000_000 },
  { label: '50M', value: 50_000_000 },
  { label: '100M', value: 100_000_000 },
];

const WORKFLOW_STEPS = [
  { step: 1, title: 'Hồ sơ & ngân sách', desc: 'Thông tin series và ngân sách đề xuất', active: true },
  { step: 2, title: 'Tải bản phác thảo', desc: 'File PDF trên trang chi tiết series', active: false },
  { step: 3, title: 'Gửi & biểu quyết', desc: 'Biên tập thẩm định → Hội đồng cấp vốn', active: false },
];

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
  const parsedBudget = Number(formData.requestedBudget.replace(/\D/g, '') || 0);

  const handleCreateSeries = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await seriesApi.create({
        title: formData.title,
        synopsis: formData.synopsis,
        genre: formData.genre.join(','),
        estimatedProductionBudget: parsedBudget,
        coverImage: formData.coverImage || undefined,
      });
      const payload = response.data as ApiResponse<SeriesDto> & { Message?: string; Data?: SeriesDto };
      toast.success(payload.message || `Tạo Series thành công! Trạng thái: ${SERIES_DRAFT_STATUS_LABEL}`);
      const createdData = payload.data;
      navigate(`/mangaka/series/${createdData?.id || 'new'}`);
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

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    updateField('requestedBudget', raw);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/mangaka/series')}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-text-primary">Tạo Series mới</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Bước 1 — lưu hồ sơ bản nháp, sau đó tải lên {NEMU_MANUSCRIPT_LABEL.toLowerCase()} trên trang chi tiết
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border-custom bg-bg-secondary p-4">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks size={15} className="text-brand" />
          <p className="text-xs font-semibold text-text-primary">Quy trình xin cấp vốn</p>
          <HelpTip
            title="Quy trình tạo series"
            ariaLabel="Hướng dẫn quy trình tạo series"
            placement="bottom-start"
            width="20rem"
            autoCloseMs={0}
            size="sm"
            content={
              <ul className="list-disc pl-4 space-y-1">
                {CREATE_SERIES_WORKFLOW_HELP.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            }
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {WORKFLOW_STEPS.map((item, idx) => (
            <div
              key={item.step}
              className={`relative rounded-lg px-3 py-2.5 border ${
                item.active
                  ? 'border-brand/30 bg-brand/5'
                  : 'border-border-custom bg-bg-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    item.active ? 'bg-brand text-white' : 'bg-bg-surface text-text-muted'
                  }`}
                >
                  {item.step}
                </span>
                <span className={`text-xs font-semibold ${item.active ? 'text-brand' : 'text-text-secondary'}`}>
                  {item.title}
                </span>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed pl-7">{item.desc}</p>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <ChevronRight
                  size={14}
                  className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-text-muted/40 z-10"
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-text-muted mt-3 pl-0.5">{CREATE_SERIES_DRAFT_NOTE}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">
                Ảnh bìa <span className="text-danger">*</span>
              </h2>
            </div>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group transition-all duration-300
                border-2 border-dashed
                ${
                  formData.coverPreviewUrl
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
                    <p className="text-xs font-medium">Bấm để {COVER_UPLOAD_LABEL}</p>
                    <p className="text-[10px] mt-0.5 text-text-muted">PNG, JPG, WebP · tối đa 5MB</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {errors.coverImage && (
              <p className="text-[11px] text-danger mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-danger" />
                {errors.coverImage}
              </p>
            )}

            {formData.coverPreviewUrl && (
              <button
                type="button"
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

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b border-border-custom/60">
              <BookOpen size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Thông tin cơ bản</h2>
            </div>

            <div>
              <label htmlFor="series-title" className="text-xs font-medium text-text-secondary mb-1.5 block">
                Tiêu đề Series <span className="text-danger">*</span>
              </label>
              <input
                id="series-title"
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="VD: Huyền Thoại Samurai"
                maxLength={100}
                className={`w-full px-4 py-3 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all ${
                  errors.title
                    ? 'border-danger/50 focus:border-danger focus:ring-1 focus:ring-danger/20'
                    : 'border-border-custom focus:border-brand/50 focus:ring-1 focus:ring-brand/20'
                }`}
              />
              <div className="flex items-center justify-between mt-1.5">
                {errors.title ? (
                  <p className="text-[11px] text-danger flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-danger" />
                    {errors.title}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-[10px] text-text-muted">{formData.title.length}/100</span>
              </div>
            </div>

            <div>
              <label htmlFor="series-synopsis" className="text-xs font-medium text-text-secondary mb-1.5 block">
                Tóm tắt nội dung <span className="text-danger">*</span>
              </label>
              <textarea
                id="series-synopsis"
                value={formData.synopsis}
                onChange={(e) => updateField('synopsis', e.target.value)}
                placeholder="Mô tả ngắn gọn nội dung, bối cảnh và nhân vật chính..."
                rows={4}
                maxLength={500}
                className={`w-full px-4 py-3 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all resize-none ${
                  errors.synopsis
                    ? 'border-danger/50 focus:border-danger focus:ring-1 focus:ring-danger/20'
                    : 'border-border-custom focus:border-brand/50 focus:ring-1 focus:ring-brand/20'
                }`}
              />
              <div className="flex items-center justify-between mt-1.5">
                {errors.synopsis ? (
                  <p className="text-[11px] text-danger flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-danger" />
                    {errors.synopsis}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-[10px] text-text-muted">{formData.synopsis.length}/500</span>
              </div>
            </div>

            <GenrePicker
              selected={formData.genre}
              onToggle={toggleGenre}
              onClear={() => updateField('genre', [])}
              error={errors.genre}
            />
          </div>

          <div className="bg-bg-secondary border border-brand/20 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-semibold text-text-primary">
                    {NEMU_BUDGET_LABEL} <span className="text-danger">*</span>
                  </h2>
                  <HelpTip
                    title={NEMU_BUDGET_LABEL}
                    ariaLabel="Hướng dẫn ngân sách bản phác thảo"
                    placement="bottom-start"
                    width="22rem"
                    autoCloseMs={0}
                    size="sm"
                    content={
                      <ul className="list-disc pl-4 space-y-1">
                        {NEMU_BUDGET_HELP.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    }
                  />
                </div>
                <p className="text-[11px] text-text-muted mt-1">{BUDGET_BOARD_SUBTITLE}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {QUICK_BUDGETS.map((qa) => (
                <button
                  key={qa.value}
                  type="button"
                  onClick={() => updateField('requestedBudget', String(qa.value))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                    parsedBudget === qa.value
                      ? 'bg-brand text-white border-brand'
                      : 'bg-bg-surface border-border-custom text-text-secondary hover:border-brand/30'
                  }`}
                >
                  {qa.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatVNDInput(formData.requestedBudget)}
                onChange={handleBudgetChange}
                placeholder="VD: 5.000.000"
                className={`w-full px-4 py-3 pr-16 bg-bg-surface border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all ${
                  errors.requestedBudget
                    ? 'border-danger/50 focus:border-danger focus:ring-1 focus:ring-danger/20'
                    : 'border-border-custom focus:border-brand/50 focus:ring-1 focus:ring-brand/20'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted font-medium">VND</span>
            </div>
            {parsedBudget > 0 && !errors.requestedBudget && (
              <p className="text-[11px] text-brand font-medium mt-1.5">{formatVND(parsedBudget)} · đề xuất</p>
            )}
            {errors.requestedBudget && (
              <p className="text-[11px] text-danger mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-danger" />
                {errors.requestedBudget}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                reset();
                navigate('/mangaka/series');
              }}
              className="px-5 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-brand/30 transition-all cursor-pointer"
            >
              <Eye size={16} />
              Xem trước
            </button>
            <button
              type="button"
              onClick={handleCreateSeries}
              disabled={isSubmitting}
              className={`
                inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all duration-200
                ${
                  isSubmitting
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

      {showPreview && <SeriesPreviewModal formData={formData} onClose={() => setShowPreview(false)} />}
    </div>
  );
};
