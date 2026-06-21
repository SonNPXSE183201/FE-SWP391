import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  Shield,
  Search,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Banknote,
  Calendar,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Scale,
  Loader2,
  X,
  Gavel,
  BookOpen,
  MapPin,
} from 'lucide-react';
import { useDisputes, useDisputeDetail, useResolveDispute } from '../hooks/useDispute';
import type { DisputeListItemDto, DisputeEvidenceDto } from '../api/dispute.api';

// ─── Helpers ───
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  Open: { label: 'Đang mở', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: <AlertTriangle size={14} /> },
  Resolved: { label: 'Đã xử lý', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle2 size={14} /> },
  Closed: { label: 'Đã đóng', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: <XCircle size={14} /> },
};

// ─── Evidence Card ───
const EvidenceCard = ({ ev }: { ev: DisputeEvidenceDto }) => {
  const isMangaka = ev.submittedBy === 'Mangaka';
  const borderColor = isMangaka ? 'border-orange-400/30' : 'border-blue-400/30';
  const badgeBg = isMangaka ? 'bg-orange-400/10 text-orange-400' : 'bg-blue-400/10 text-blue-400';

  return (
    <div className={`bg-bg-surface border ${borderColor} rounded-xl p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${badgeBg}`}>
            <User size={12} />
          </div>
          <span className="text-xs font-medium text-text-primary">{ev.submitterName}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeBg}`}>
            {ev.submittedBy}
          </span>
        </div>
        <span className="text-[10px] text-text-muted">{formatDateTime(ev.createdAt ?? '')}</span>
      </div>

      {ev.type === 'text' ? (
        <p className="text-sm text-text-secondary leading-relaxed">{ev.content}</p>
      ) : (
        <div className="rounded-lg overflow-hidden border border-border-custom">
          <img src={ev.content ?? ''} alt="Evidence" className="w-full h-48 object-cover" />
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───
export const DisputeManagementFeature = () => {
  const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Open' | 'Resolved' | 'Closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Resolve Modal State ───
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [assistantPercent, setAssistantPercent] = useState(50);
  const [editorNote, setEditorNote] = useState('');

  // ─── Queries ───
  const { data: disputes = [], isLoading: listLoading } = useDisputes();
  const { data: disputeDetail, isLoading: detailLoading } = useDisputeDetail(selectedDisputeId ?? 0);
  const resolveDispute = useResolveDispute();

  // ─── Filters ───
  const filteredDisputes = useMemo(() => {
    return disputes.filter((d: DisputeListItemDto) => {
      const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (d.taskTitle ?? '').toLowerCase().includes(q) ||
        (d.seriesTitle ?? '').toLowerCase().includes(q) ||
        (d.mangakaName ?? '').toLowerCase().includes(q) ||
        (d.assistantName ?? '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [disputes, filterStatus, searchQuery]);

  const statusCounts = useMemo(() => ({
    all: disputes.length,
    Open: disputes.filter((d: DisputeListItemDto) => d.status === 'Open').length,
    Resolved: disputes.filter((d: DisputeListItemDto) => d.status === 'Resolved').length,
    Closed: disputes.filter((d: DisputeListItemDto) => d.status === 'Closed').length,
  }), [disputes]);

  // ─── Handlers ───
  const handleOpenResolve = () => {
    setAssistantPercent(50);
    setEditorNote('');
    setShowResolveModal(true);
  };

  const handleResolve = () => {
    if (!editorNote.trim()) {
      toast.error('Vui lòng nhập ghi chú phân xử.');
      return;
    }
    if (!selectedDisputeId) return;

    resolveDispute.mutate(
      { disputeId: selectedDisputeId, payload: { assistantPaymentPercent: assistantPercent, editorNote } },
      {
        onSuccess: () => {
          toast.success('Đã phân xử tranh chấp thành công!');
          setShowResolveModal(false);
          setSelectedDisputeId(null);
        },
        onError: () => toast.error('Có lỗi xảy ra. Vui lòng thử lại.'),
      },
    );
  };

  // ═══════════════════════════════════════════
  //  DETAIL VIEW
  // ═══════════════════════════════════════════
  if (selectedDisputeId) {
    if (detailLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-brand" size={32} />
        </div>
      );
    }

    if (!disputeDetail) {
      return (
        <div className="text-center py-10 text-text-muted">
          Không tìm thấy thông tin tranh chấp.
          <button onClick={() => setSelectedDisputeId(null)} className="block mx-auto mt-4 text-brand hover:underline bg-transparent border-none cursor-pointer">
            ← Quay lại danh sách
          </button>
        </div>
      );
    }

    const sc = statusConfig[disputeDetail.status ?? 'Open'] ?? statusConfig.Open;
    const lockedAmt = disputeDetail.lockedAmount ?? 0;
    const assistantAmount = Math.round(lockedAmt * assistantPercent / 100);
    const mangakaRefund = lockedAmt - assistantAmount;
    const evidenceList = disputeDetail.evidence ?? [];
    const mangakaEvidence = evidenceList.filter(e => e.submittedBy === 'Mangaka');
    const assistantEvidence = evidenceList.filter(e => e.submittedBy === 'Assistant');

    return (
      <div className="animate-fade-in">
        {/* ─── Header ─── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedDisputeId(null)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-text-primary truncate">Tranh chấp: {disputeDetail.taskTitle}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${sc.bg} ${sc.color}`}>
                {sc.icon} {sc.label}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {disputeDetail.seriesTitle} • {disputeDetail.chapterTitle} • Mở lúc {formatDateTime(disputeDetail.createdAt ?? '')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ─── LEFT: Task Info + Evidence ─── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Task Info */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Thông tin Task</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-bg-surface border border-border-custom rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Task</p>
                  <p className="text-sm font-medium text-text-primary">{disputeDetail.taskTitle}</p>
                </div>
                <div className="bg-bg-surface border border-border-custom rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Region</p>
                  <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                    <MapPin size={12} className="text-text-muted" /> {disputeDetail.regionInfo}
                  </p>
                </div>
                <div className="bg-bg-surface border border-border-custom rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Deadline</p>
                  <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                    <Clock size={12} className="text-text-muted" /> {formatDateTime(disputeDetail.taskDeadline ?? '')}
                  </p>
                </div>
                <div className="bg-bg-surface border border-border-custom rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Số tiền Lock</p>
                  <p className="text-sm font-bold text-amber-400">{formatCurrency(lockedAmt)}</p>
                </div>
              </div>
            </div>

            {/* Reasons */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Lý do tranh chấp</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bg-surface border border-orange-400/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-orange-400/10 flex items-center justify-center">
                      <User size={12} className="text-orange-400" />
                    </div>
                    <span className="text-xs font-medium text-orange-400">Mangaka — {disputeDetail.mangakaName}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{disputeDetail.mangakaReason}</p>
                </div>
                <div className="bg-bg-surface border border-blue-400/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-400/10 flex items-center justify-center">
                      <User size={12} className="text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-blue-400">Assistant — {disputeDetail.assistantName}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{disputeDetail.assistantReason}</p>
                </div>
              </div>
            </div>

            {/* Evidence */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Bằng chứng ({evidenceList.length})</h2>
              </div>
              {evidenceList.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">Chưa có bằng chứng nào được gửi.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mangaka Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <span className="text-xs font-medium text-text-secondary">Từ Mangaka ({mangakaEvidence.length})</span>
                    </div>
                    {mangakaEvidence.length > 0 ? (
                      mangakaEvidence.map((ev: any, idx: number) => <EvidenceCard key={`mangaka-${idx}`} ev={ev} />)
                    ) : (
                      <p className="text-xs text-text-muted text-center py-4">Không có</p>
                    )}
                  </div>
                  {/* Assistant Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs font-medium text-text-secondary">Từ Assistant ({assistantEvidence.length})</span>
                    </div>
                    {assistantEvidence.length > 0 ? (
                      assistantEvidence.map((ev: any, idx: number) => <EvidenceCard key={`assistant-${idx}`} ev={ev} />)
                    ) : (
                      <p className="text-xs text-text-muted text-center py-4">Không có</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Participants + Resolve Action ─── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Parties */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Scale size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Các bên liên quan</h2>
              </div>
              <div className="space-y-3">
                <div className="bg-bg-surface border border-orange-400/20 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-400/10 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{disputeDetail.mangakaName}</p>
                    <p className="text-[10px] text-orange-400 font-medium">Mangaka</p>
                  </div>
                </div>
                <div className="bg-bg-surface border border-blue-400/20 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-400/10 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{disputeDetail.assistantName}</p>
                    <p className="text-[10px] text-blue-400 font-medium">Assistant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Banknote size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Tài chính</h2>
              </div>
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Số tiền Lock</span>
                  <span className="text-sm font-bold text-text-primary">{formatCurrency(lockedAmt)}</span>
                </div>
                {disputeDetail.status === 'Resolved' && disputeDetail.resolution && (
                  <>
                    <div className="h-px bg-border-custom" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-muted">Kết quả</span>
                      <span className="text-sm font-medium text-emerald-400">{disputeDetail.resolution}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Resolve Action */}
            {disputeDetail.status === 'Open' && (
              <div className="bg-bg-secondary border border-brand/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Gavel size={16} className="text-brand" />
                  <h2 className="text-sm font-semibold text-text-primary">Phân xử</h2>
                </div>
                <p className="text-xs text-text-secondary mb-4">
                  Xem xét bằng chứng 2 bên và điều chỉnh tỷ lệ Nhuận bút (Partial Payment) theo Rule T06.
                </p>
                <button
                  onClick={handleOpenResolve}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all duration-200 bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Gavel size={14} />
                  Tiến hành phân xử
                </button>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Dòng thời gian</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-text-primary">Mở tranh chấp</p>
                    <p className="text-[10px] text-text-muted">{formatDateTime(disputeDetail.createdAt ?? '')}</p>
                  </div>
                </div>
                {evidenceList.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-text-primary">{evidenceList.length} bằng chứng đã gửi</p>
                      <p className="text-[10px] text-text-muted">Lần cuối: {formatDateTime(evidenceList[evidenceList.length - 1].createdAt ?? '')}</p>
                    </div>
                  </div>
                )}
                {disputeDetail.resolvedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-text-primary">Đã phân xử</p>
                      <p className="text-[10px] text-text-muted">{formatDateTime(disputeDetail.resolvedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ RESOLVE MODAL ═══════ */}
        {showResolveModal && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResolveModal(false)} />

            {/* Modal */}
            <div className="relative bg-bg-primary border border-border-custom rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                    <Gavel size={16} className="text-brand" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Phân xử tranh chấp</h3>
                    <p className="text-[10px] text-text-muted">Rule T06 — Partial Payment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="p-1.5 rounded-lg hover:bg-bg-surface transition-colors bg-transparent border-none text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-5 space-y-5">
                {/* Locked Amount */}
                <div className="bg-bg-surface border border-border-custom rounded-xl p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Tổng tiền Lock</p>
                  <p className="text-2xl font-bold text-text-primary">{formatCurrency(lockedAmt)}</p>
                </div>

                {/* Slider */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-text-primary flex items-center gap-2">
                    <Scale size={14} className="text-brand" />
                    Tỷ lệ thanh toán cho Assistant
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={assistantPercent}
                      onChange={(e) => setAssistantPercent(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${assistantPercent}%, #f97316 ${assistantPercent}%, #f97316 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-text-muted mt-1">
                      <span>0%</span>
                      <span className="text-sm font-bold text-brand">{assistantPercent}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-bg-surface border border-blue-400/20 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-blue-400 font-medium mb-0.5">→ Assistant nhận</p>
                      <p className="text-lg font-bold text-blue-400">{formatCurrency(assistantAmount)}</p>
                      <p className="text-[10px] text-text-muted">{assistantPercent}%</p>
                    </div>
                    <div className="bg-bg-surface border border-orange-400/20 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-orange-400 font-medium mb-0.5">← Mangaka hoàn</p>
                      <p className="text-lg font-bold text-orange-400">{formatCurrency(mangakaRefund)}</p>
                      <p className="text-[10px] text-text-muted">{100 - assistantPercent}%</p>
                    </div>
                  </div>
                </div>

                {/* Editor Note */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-primary flex items-center gap-2">
                    <MessageSquare size={14} className="text-brand" />
                    Ghi chú phân xử
                  </label>
                  <textarea
                    value={editorNote}
                    onChange={(e) => setEditorNote(e.target.value)}
                    rows={3}
                    placeholder="Nhập lý do phân xử và căn cứ quyết định..."
                    className="w-full bg-bg-surface border border-border-custom rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:border-brand/50 focus:ring-brand/20 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 pb-5">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleResolve}
                  disabled={resolveDispute.isPending}
                  className={`
                    inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border-none cursor-pointer transition-all
                    ${resolveDispute.isPending
                      ? 'bg-brand/50 text-white/70 cursor-not-allowed'
                      : 'bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover'
                    }
                  `}
                >
                  {resolveDispute.isPending ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Gavel size={14} />
                  )}
                  Xác nhận phân xử
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  LIST VIEW
  // ═══════════════════════════════════════════
  return (
    <div className="animate-fade-in">
      {/* ─── Header ─── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Shield size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Phân xử tranh chấp</h1>
            <p className="page-header__subtitle">
              {listLoading ? 'Đang tải...' : `${statusCounts.Open} tranh chấp đang chờ xử lý`}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo task, series, Mangaka, Assistant..."
            className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:border-brand/50 focus:ring-brand/20 transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-bg-surface border border-border-custom rounded-xl p-1">
          {([
            { key: 'Open' as const, label: 'Đang mở', count: statusCounts.Open },
            { key: 'Resolved' as const, label: 'Đã xử lý', count: statusCounts.Resolved },
            { key: 'Closed' as const, label: 'Đã đóng', count: statusCounts.Closed },
            { key: 'all' as const, label: 'Tất cả', count: statusCounts.all },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none
                ${filterStatus === tab.key
                  ? 'bg-brand/15 text-brand'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
                }
              `}
            >
              {tab.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${filterStatus === tab.key ? 'bg-brand/20' : 'bg-bg-secondary'
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Loading ─── */}
      {listLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-brand" size={28} />
        </div>
      )}

      {/* ─── Empty State ─── */}
      {!listLoading && filteredDisputes.length === 0 && (
        <div className="text-center py-16">
          <Shield size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
          <p className="text-text-muted text-sm">
            {searchQuery || filterStatus !== 'all'
              ? 'Không tìm thấy tranh chấp phù hợp với bộ lọc.'
              : 'Chưa có tranh chấp nào.'}
          </p>
        </div>
      )}

      {/* ─── Dispute Cards ─── */}
      <div className="space-y-3">
        {!listLoading && filteredDisputes.map((dispute: DisputeListItemDto) => {
          const sc = statusConfig[dispute.status ?? 'Open'] ?? statusConfig.Open;
          return (
            <div
              key={dispute.id}
              onClick={() => setSelectedDisputeId(dispute.id ?? 0)}
              className="bg-bg-secondary border border-border-custom rounded-xl p-5 hover:border-brand/20 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${sc.bg}`}>
                  {sc.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
                      {dispute.taskTitle}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border ${sc.bg} ${sc.color} flex-shrink-0`}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} /> {dispute.seriesTitle}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-orange-400">
                      <User size={11} /> {dispute.mangakaName}
                    </span>
                    <span>vs</span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <User size={11} /> {dispute.assistantName}
                    </span>
                  </div>
                </div>

                {/* Right Info */}
                <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-bold text-text-primary">{formatCurrency(dispute.lockedAmount ?? 0)}</span>
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Clock size={10} /> {formatDate(dispute.createdAt ?? '')}
                  </span>
                </div>

                {/* Arrow */}
                <ChevronRight size={16} className="text-text-muted group-hover:text-brand transition-colors flex-shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
