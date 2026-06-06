import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileText,
  ImagePlus,
  Banknote,
  Tags,
  Send,
  RotateCcw,
  X,
  MessageSquare,
  ClipboardCheck,
  User,
  Calendar,
} from 'lucide-react';

// ─── Mock Data (temporary — replace with API call) ───
const MOCK_SERIES_DETAIL = {
  id: 'series-001',
  title: 'Huyền Thoại Samurai',
  synopsis:
    'Trong thời đại Edo đầy biến động, một samurai trẻ tên Kenji phải tìm lại thanh kiếm bị đánh cắp của gia tộc trước khi thế lực bóng tối thống trị thiên hạ.',
  genres: ['Shōnen', 'Action', 'Historical'],
  coverUrl: '',
  mangakaName: 'Nguyễn Minh Đức',
  submittedAt: '2026-06-01T10:00:00Z',
  requestedBudget: 2500000,
  nameFileUrl: '#',
  nameFileName: 'samurai_name_v1.pdf',
  status: 'Pending_Review' as const,
};

export const ReviewSeriesFeature = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();

  const [editorNotes, setEditorNotes] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const series = MOCK_SERIES_DETAIL;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleSubmitToBoard = async () => {
    if (!editorNotes.trim()) {
      toast.error('Vui lòng nhập nhận xét trước khi trình Hội đồng.');
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: Replace with API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success('Đã trình hồ sơ lên Hội đồng Biên tập!');
      navigate('/editor/review');
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionReason.trim()) {
      toast.error('Vui lòng nhập lý do yêu cầu sửa.');
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: Replace with API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success('Đã gửi yêu cầu sửa đổi cho Mangaka.');
      setShowRevisionModal(false);
      navigate('/editor/review');
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/editor/review')}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary">
            Review hồ sơ Series
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Series ID: {seriesId}
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
          Chờ Review
        </span>
      </div>

      {/* ─── Two Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ─── LEFT: Series Detail ─── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Cover & Basic Info */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Thông tin Series</h2>
            </div>

            <div className="flex gap-5">
              {/* Cover image */}
              <div className="w-28 h-[150px] rounded-xl overflow-hidden bg-bg-surface flex-shrink-0 border border-border-custom">
                {series.coverUrl ? (
                  <img src={series.coverUrl} alt={series.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <ImagePlus size={28} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{series.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={12} className="text-text-muted" />
                    <span className="text-xs text-text-secondary">{series.mangakaName}</span>
                    <span className="text-text-muted text-xs">·</span>
                    <Calendar size={12} className="text-text-muted" />
                    <span className="text-xs text-text-secondary">
                      {new Date(series.submittedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {series.genres.map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tags size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Tóm tắt nội dung</h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{series.synopsis}</p>
          </div>

          {/* Finance & Name File */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Banknote size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Tài chính & Phác thảo</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Budget card */}
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">
                  Vốn yêu cầu
                </p>
                <p className="text-xl font-bold text-text-primary">
                  {formatCurrency(series.requestedBudget)}
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                  Mangaka đề xuất cho Chapter 1
                </p>
              </div>

              {/* Name file card */}
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">
                  Bản phác thảo (Name)
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <FileText size={16} className="text-brand" />
                  <span className="text-sm text-text-primary truncate flex-1">{series.nameFileName}</span>
                </div>
                <button
                  onClick={() => toast.success('Đang tải file...')}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-brand/10 hover:bg-brand/15 text-brand rounded-lg text-xs font-medium transition-colors border-none cursor-pointer"
                >
                  <Download size={14} />
                  Tải xuống PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Editor Notes & Actions ─── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Editor Notes */}
          <div className="bg-bg-secondary border border-border-custom rounded-xl p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Đánh giá của Editor</h2>
            </div>

            {/* QC Checklist */}
            <div className="space-y-2 mb-4">
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                Checklist kiểm tra
              </p>
              {[
                'Nội dung tóm tắt rõ ràng, hấp dẫn',
                'Thể loại phù hợp thị trường mục tiêu',
                'Phác thảo (Name) đạt chất lượng cơ bản',
                'Ngân sách yêu cầu hợp lý',
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-bg-surface transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 rounded accent-brand cursor-pointer"
                  />
                  <span className="text-xs text-text-secondary">{item}</span>
                </label>
              ))}
            </div>

            {/* Notes textarea */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                <MessageSquare size={12} className="inline mr-1" />
                Nhận xét / Ghi chú <span className="text-danger">*</span>
              </label>
              <textarea
                value={editorNotes}
                onChange={(e) => setEditorNotes(e.target.value)}
                placeholder="Nhập nhận xét chi tiết về hồ sơ này..."
                rows={5}
                className="w-full px-4 py-3 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:border-brand/50 focus:ring-brand/20 transition-all resize-none"
                maxLength={1000}
              />
              <p className="text-[10px] text-text-muted mt-1 text-right">{editorNotes.length}/1000</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleSubmitToBoard}
                disabled={isSubmitting}
                className={`
                  inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all duration-200
                  ${isSubmitting
                    ? 'bg-brand/50 text-white/70 cursor-not-allowed'
                    : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Trình Hội đồng (Board)
                  </>
                )}
              </button>
              <button
                onClick={() => setShowRevisionModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-amber-500/30 hover:bg-amber-500/5 transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                Yêu cầu sửa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Revision Modal ─── */}
      {showRevisionModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRevisionModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <RotateCcw size={16} className="text-amber-400" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">Yêu cầu sửa đổi</h3>
              </div>
              <button
                onClick={() => setShowRevisionModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-text-secondary">
                Hồ sơ sẽ được trả về cho <span className="text-text-primary font-medium">{series.mangakaName}</span> để chỉnh sửa.
              </p>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Lý do yêu cầu sửa <span className="text-danger">*</span>
                </label>
                <textarea
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="Mô tả chi tiết những gì Mangaka cần sửa đổi..."
                  rows={4}
                  className="w-full px-4 py-3 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:border-brand/50 focus:ring-brand/20 transition-all resize-none"
                  maxLength={500}
                />
                <p className="text-[10px] text-text-muted mt-1 text-right">{revisionReason.length}/500</p>
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={isSubmitting}
                className={`
                  inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border-none cursor-pointer transition-all
                  ${isSubmitting
                    ? 'bg-amber-500/50 text-white/70 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
