import { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  Vote,
  Eye,
  X,
  Check,
  Banknote,
  Calendar,
  User,
  FileText,
  Download,
  ChevronRight,
  ImagePlus,
  Tags,
  Clock,
  BookOpen,
} from 'lucide-react';
import { CustomSelect } from '../../../components/common/CustomSelect';
import type { SelectOption } from '../../../components/common/CustomSelect';

// ─── Schedule Options ───
const SCHEDULE_OPTIONS: SelectOption[] = [
  { value: 'weekly', label: 'Hàng tuần (Weekly)' },
  { value: 'biweekly', label: '2 tuần 1 lần (Bi-weekly)' },
  { value: 'monthly', label: 'Hàng tháng (Monthly)' },
];

// ─── Mock Data ───
interface PendingProposal {
  id: string;
  title: string;
  mangakaName: string;
  submittedAt: string;
  requestedBudget: number;
  genres: string[];
  editorName: string;
  editorNote: string;
  synopsis: string;
  coverUrl: string;
  nameFileName: string;
}

import { usePendingProposals, useApproveProposal } from '../hooks/useApproval';

export const BoardApprovalFeature = () => {
  const [selectedProposal, setSelectedProposal] = useState<PendingProposal | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvedBudget, setApprovedBudget] = useState('');
  const [publishSchedule, setPublishSchedule] = useState('');
  const { data: proposals = [], isLoading } = usePendingProposals();
  const approveProposal = useApproveProposal();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatCurrencyInput = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(numericValue));
  };

  const handleBudgetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setApprovedBudget(raw);
  };

  const handleOpenApproveModal = (proposal: PendingProposal) => {
    setSelectedProposal(proposal);
    setApprovedBudget(String(proposal.requestedBudget));
    setPublishSchedule('');
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    if (!approvedBudget || Number(approvedBudget) <= 0) {
      toast.error('Vui lòng nhập ngân sách hợp lệ.');
      return;
    }
    if (!publishSchedule) {
      toast.error('Vui lòng chọn lịch xuất bản.');
      return;
    }
    if (!selectedProposal) return;
    
    approveProposal.mutate(
      { seriesId: selectedProposal.id, payload: { approvedBudget: Number(approvedBudget), publishSchedule } },
      {
        onSuccess: () => {
          toast.success(`Đã phê duyệt "${selectedProposal.title}" thành công!`);
          setShowApproveModal(false);
          setSelectedProposal(null);
        },
        onError: () => toast.error('Có lỗi xảy ra. Vui lòng thử lại.'),
      }
    );
  };

  // ── Detail View ──
  if (selectedProposal && !showApproveModal) {
    return (
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedProposal(null)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">{selectedProposal.title}</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Review chi tiết hồ sơ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Series info */}
          <div className="lg:col-span-3 space-y-5">
            {/* Info card */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Thông tin Series</h2>
              </div>
              <div className="flex gap-5">
                <div className="w-28 h-[150px] rounded-xl overflow-hidden bg-bg-surface flex-shrink-0 border border-border-custom">
                  {selectedProposal.coverUrl ? (
                    <img src={selectedProposal.coverUrl} alt={selectedProposal.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <ImagePlus size={28} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{selectedProposal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <User size={12} className="text-text-muted" />
                      <span className="text-xs text-text-secondary">{selectedProposal.mangakaName}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProposal.genres.map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium">{g}</span>
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
              <p className="text-sm text-text-secondary leading-relaxed">{selectedProposal.synopsis}</p>
            </div>

            {/* Finance */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Banknote size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Tài chính & Phác thảo</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Vốn yêu cầu</p>
                  <p className="text-xl font-bold text-text-primary">{formatCurrency(selectedProposal.requestedBudget)}</p>
                </div>
                <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Bản phác thảo</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <FileText size={16} className="text-brand" />
                    <span className="text-sm text-text-primary truncate flex-1">{selectedProposal.nameFileName}</span>
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

          {/* RIGHT: Editor evaluation + Actions */}
          <div className="lg:col-span-2 space-y-5">
            {/* Editor evaluation */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <User size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Đánh giá của Editor</h2>
              </div>
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                    <User size={12} className="text-brand" />
                  </div>
                  <span className="text-xs font-medium text-text-primary">{selectedProposal.editorName}</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{selectedProposal.editorNote}</p>
              </div>
            </div>

            {/* Action */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <button
                onClick={() => handleOpenApproveModal(selectedProposal)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all duration-200 bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0"
              >
                <Check size={14} />
                Phê duyệt Series
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main List View ──
  return (
    <div className="animate-fade-in">
      {/* ─── Header ─── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Vote size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Xét duyệt hồ sơ Series</h1>
            <p className="page-header__subtitle">
              {isLoading ? 'Đang tải...' : `${proposals.length} hồ sơ đang chờ phê duyệt`}
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ─── Proposal Cards ─── */}
      <div className="mt-6 space-y-4">
        {!isLoading && proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="bg-bg-secondary border border-border-custom rounded-xl p-5 hover:border-brand/20 transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              {/* Cover thumbnail */}
              <div className="w-16 h-[85px] rounded-lg overflow-hidden bg-bg-surface flex-shrink-0 border border-border-custom">
                {proposal.coverUrl ? (
                  <img src={proposal.coverUrl} alt={proposal.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <ImagePlus size={18} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-text-primary group-hover:text-brand transition-colors">
                      {proposal.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5">
                        <User size={11} className="text-text-muted" />
                        <span className="text-xs text-text-secondary">{proposal.mangakaName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-text-muted" />
                        <span className="text-xs text-text-secondary">
                          {new Date(proposal.submittedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium whitespace-nowrap">
                    Chờ duyệt
                  </span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {proposal.genres.map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium">
                      {g}
                    </span>
                  ))}
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-custom">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Banknote size={13} className="text-text-muted" />
                      <span className="text-sm font-semibold text-text-primary">
                        {formatCurrency(proposal.requestedBudget)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={11} className="text-text-muted" />
                      <span className="text-xs text-text-secondary">Editor: {proposal.editorName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProposal(proposal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface border border-border-custom rounded-lg text-xs text-text-secondary hover:text-text-primary hover:border-brand/20 transition-all cursor-pointer"
                    >
                      <Eye size={12} />
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleOpenApproveModal(proposal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/15 text-brand rounded-lg text-xs font-medium transition-colors border-none cursor-pointer"
                    >
                      <Check size={12} />
                      Phê duyệt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Approve Modal ─── */}
      {showApproveModal && selectedProposal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowApproveModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-xl w-full max-w-lg animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Check size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Phê duyệt Series</h3>
                  <p className="text-[10px] text-text-muted">{selectedProposal.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Requested budget (read only) */}
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                      Vốn Mangaka yêu cầu
                    </p>
                    <p className="text-lg font-bold text-text-primary mt-1">
                      {formatCurrency(selectedProposal.requestedBudget)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                    <Banknote size={20} className="text-brand" />
                  </div>
                </div>
              </div>

              {/* Approved budget */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Ngân sách cấp thực tế (VNĐ) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={approvedBudget ? formatCurrencyInput(approvedBudget) : ''}
                    onChange={handleBudgetInputChange}
                    placeholder="Nhập số tiền cấp..."
                    className="w-full px-4 py-2.5 pr-14 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:border-brand/50 focus:ring-brand/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">
                    VNĐ
                  </span>
                </div>
                <p className="text-[10px] text-text-muted mt-1.5">
                  Board có thể điều chỉnh số tiền so với đề xuất của Mangaka.
                </p>
              </div>

              {/* Publish schedule */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  <Calendar size={12} className="inline mr-1" />
                  Lịch xuất bản <span className="text-danger">*</span>
                </label>
                <CustomSelect
                  options={SCHEDULE_OPTIONS}
                  value={publishSchedule}
                  onChange={setPublishSchedule}
                  placeholder="Chọn lịch xuất bản..."
                  icon={<Calendar size={14} />}
                />
                <p className="text-[10px] text-text-muted mt-1.5">
                  Tần suất phát hành chapter mới cho series này.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleApprove}
                disabled={approveProposal.isPending}
                className={`
                  inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border-none cursor-pointer transition-all
                  ${approveProposal.isPending
                    ? 'bg-emerald-500/50 text-white/70 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                  }
                `}
              >
                {approveProposal.isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Chốt phê duyệt
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
