import { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  Vote,
  Eye,
  X,
  ChevronRight,
  Search,
  Loader2,
  User,
  Calendar,
  Banknote,
  BookOpen,
  Tags,
  CheckCircle,
  XCircle,
  MinusCircle,
  MessageSquare,
  Clock,
  ImagePlus,
  BarChart3,
} from 'lucide-react';
import { useVotingList, useSubmitBoardVote } from '../hooks/useVoting';
import type { VotingSeriesItem, VoteDecision, VotingStatus } from '../api/voting.api';

const FILTER_TABS: { value: VotingStatus | 'All'; label: string }[] = [
  { value: 'All', label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ biểu quyết' },
  { value: 'Voted', label: 'Đã bỏ phiếu' },
  { value: 'Closed', label: 'Đã đóng' },
];

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const getVoteDecisionConfig = (decision: VoteDecision) => {
  switch (decision) {
    case 'Approve':
      return { label: 'Phê duyệt', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle };
    case 'Reject':
      return { label: 'Từ chối', color: 'text-danger', bg: 'bg-danger/10', icon: XCircle };
    case 'Abstain':
      return { label: 'Bỏ qua', color: 'text-text-muted', bg: 'bg-bg-surface', icon: MinusCircle };
  }
};

const getStatusBadge = (status: VotingStatus, myVote?: VoteDecision) => {
  if (status === 'Voted' && myVote) {
    const cfg = getVoteDecisionConfig(myVote);
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
        <cfg.icon size={11} />
        Đã vote: {cfg.label}
      </span>
    );
  }
  switch (status) {
    case 'Pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400">Chờ biểu quyết</span>;
    case 'Closed':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-text-muted/10 text-text-muted">Đã đóng</span>;
    default:
      return null;
  }
};

export const VotingFeature = () => {
  const [filter, setFilter] = useState<VotingStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<VotingSeriesItem | null>(null);

  // Vote modal
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteTarget, setVoteTarget] = useState<VotingSeriesItem | null>(null);
  const [voteDecision, setVoteDecision] = useState<VoteDecision>('Approve');
  const [voteComment, setVoteComment] = useState('');

  const { data: votingList = [], isLoading } = useVotingList(filter);
  const submitVoteMutation = useSubmitBoardVote();

  const filteredList = votingList.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.mangakaName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenVoteModal = (item: VotingSeriesItem) => {
    setVoteTarget(item);
    setVoteDecision('Approve');
    setVoteComment('');
    setShowVoteModal(true);
  };

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voteTarget) return;

    try {
      await submitVoteMutation.mutateAsync({
        votingId: voteTarget.id,
        decision: voteDecision,
        comment: voteComment,
      });
      toast.success(`Bỏ phiếu "${getVoteDecisionConfig(voteDecision).label}" cho "${voteTarget.title}" thành công!`);
      setShowVoteModal(false);
      setSelectedItem(null);
    } catch {
      toast.error('Gửi phiếu thất bại. Vui lòng thử lại.');
    }
  };

  const getTotalVotes = (item: VotingSeriesItem) =>
    item.voteResults.approve + item.voteResults.reject + item.voteResults.abstain;

  const getPercentage = (count: number, total: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100);

  // ── Detail View ──
  if (selectedItem) {
    const totalVotes = getTotalVotes(selectedItem);
    return (
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedItem(null)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">{selectedItem.title}</h1>
            <p className="text-xs text-text-muted mt-0.5">Chi tiết đề xuất và kết quả biểu quyết</p>
          </div>
          {getStatusBadge(selectedItem.status, selectedItem.myVote)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Series Info */}
          <div className="lg:col-span-3 space-y-5">
            {/* Cover + Basic info */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Thông tin Series</h2>
              </div>
              <div className="flex gap-5">
                <div className="w-28 h-[160px] rounded-xl overflow-hidden bg-bg-surface flex-shrink-0 border border-border-custom">
                  {selectedItem.coverImageUrl ? (
                    <img src={selectedItem.coverImageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <ImagePlus size={28} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{selectedItem.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <User size={12} className="text-text-muted" />
                      <span className="text-xs text-text-secondary">{selectedItem.mangakaName}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.genres.map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium">{g}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>Gửi: {new Date(selectedItem.submittedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>Hạn: {new Date(selectedItem.deadline).toLocaleDateString('vi-VN')}</span>
                    </div>
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
              <p className="text-sm text-text-secondary leading-relaxed">{selectedItem.synopsis}</p>
            </div>

            {/* Budget info */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Banknote size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Ngân sách đề xuất</h2>
              </div>
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">Vốn yêu cầu</p>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(selectedItem.requestedBudget)}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Editor + Vote Results + Actions */}
          <div className="lg:col-span-2 space-y-5">
            {/* Editor Recommendation */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <User size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Đánh giá của Editor</h2>
              </div>
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                    <User size={12} className="text-brand" />
                  </div>
                  <span className="text-xs font-medium text-text-primary">{selectedItem.editorName}</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{selectedItem.editorRecommendation}</p>
              </div>
            </div>

            {/* Vote Distribution */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Kết quả biểu quyết</h2>
                <span className="ml-auto text-xs text-text-muted">{totalVotes}/{selectedItem.voteResults.total} phiếu</span>
              </div>
              <div className="space-y-3">
                {/* Approve bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-success font-medium">
                      <CheckCircle size={12} />
                      Phê duyệt
                    </div>
                    <span className="text-xs font-bold text-success">{selectedItem.voteResults.approve} ({getPercentage(selectedItem.voteResults.approve, totalVotes)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(selectedItem.voteResults.approve, totalVotes)}%` }}
                    />
                  </div>
                </div>
                {/* Reject bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-danger font-medium">
                      <XCircle size={12} />
                      Từ chối
                    </div>
                    <span className="text-xs font-bold text-danger">{selectedItem.voteResults.reject} ({getPercentage(selectedItem.voteResults.reject, totalVotes)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-danger rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(selectedItem.voteResults.reject, totalVotes)}%` }}
                    />
                  </div>
                </div>
                {/* Abstain bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                      <MinusCircle size={12} />
                      Bỏ qua
                    </div>
                    <span className="text-xs font-bold text-text-muted">{selectedItem.voteResults.abstain} ({getPercentage(selectedItem.voteResults.abstain, totalVotes)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-text-muted/40 rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(selectedItem.voteResults.abstain, totalVotes)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            {selectedItem.status === 'Pending' && (
              <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
                <button
                  onClick={() => handleOpenVoteModal(selectedItem)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all duration-200 bg-brand hover:bg-brand-hover text-white shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Vote size={14} />
                  Bỏ phiếu biểu quyết
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main List View ──
  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Vote size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Biểu quyết Series</h1>
            <p className="page-header__subtitle">
              {isLoading ? 'Đang tải...' : `${filteredList.length} đề xuất series`}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm series hoặc tác giả..."
            className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-bg-secondary border border-border-custom rounded-xl p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all ${
                filter === tab.value
                  ? 'bg-brand text-white shadow-brand'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={32} className="animate-spin text-brand" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-20">
          <Vote size={40} className="text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted">Không có đề xuất phù hợp với bộ lọc</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item) => {
            const totalVotes = getTotalVotes(item);
            const approvePercent = getPercentage(item.voteResults.approve, totalVotes);
            const rejectPercent = getPercentage(item.voteResults.reject, totalVotes);

            return (
              <div
                key={item.id}
                className="bg-bg-secondary border border-border-custom rounded-xl p-5 hover:border-brand/20 transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  {/* Cover thumbnail */}
                  <div className="w-16 h-[85px] rounded-lg overflow-hidden bg-bg-surface flex-shrink-0 border border-border-custom">
                    {item.coverImageUrl ? (
                      <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover" />
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
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5">
                            <User size={11} className="text-text-muted" />
                            <span className="text-xs text-text-secondary">{item.mangakaName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-text-muted" />
                            <span className="text-xs text-text-secondary">
                              Hạn: {new Date(item.deadline).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(item.status, item.myVote)}
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.genres.map((g) => (
                        <span key={g} className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium">
                          {g}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-custom">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Banknote size={13} className="text-text-muted" />
                          <span className="text-sm font-semibold text-text-primary">
                            {formatCurrency(item.requestedBudget)}
                          </span>
                        </div>
                        {/* Mini vote bar */}
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-bg-surface rounded-full overflow-hidden flex">
                            <div className="h-full bg-success transition-all" style={{ width: `${approvePercent}%` }} />
                            <div className="h-full bg-danger transition-all" style={{ width: `${rejectPercent}%` }} />
                          </div>
                          <span className="text-[10px] text-text-muted">{totalVotes}/{item.voteResults.total}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface border border-border-custom rounded-lg text-xs text-text-secondary hover:text-text-primary hover:border-brand/20 transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                          Chi tiết
                        </button>
                        {item.status === 'Pending' && (
                          <button
                            onClick={() => handleOpenVoteModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/15 text-brand rounded-lg text-xs font-medium transition-colors border-none cursor-pointer"
                          >
                            <Vote size={12} />
                            Bỏ phiếu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Vote Modal ─── */}
      {showVoteModal && voteTarget && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowVoteModal(false)} />
          <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-lg shadow-xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Vote size={16} className="text-brand" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Biểu quyết Series</h3>
                  <p className="text-[10px] text-text-muted">{voteTarget.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowVoteModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleVoteSubmit} className="p-5 space-y-5">
              {/* Decision Selection */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Quyết định biểu quyết <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Approve', 'Reject', 'Abstain'] as VoteDecision[]).map((decision) => {
                    const cfg = getVoteDecisionConfig(decision);
                    const isSelected = voteDecision === decision;
                    return (
                      <button
                        key={decision}
                        type="button"
                        onClick={() => setVoteDecision(decision)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? `${cfg.bg} ${cfg.color} border-current shadow-sm`
                            : 'bg-bg-surface border-border-custom text-text-secondary hover:border-brand/20'
                        }`}
                      >
                        <cfg.icon size={18} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget info */}
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Ngân sách yêu cầu</p>
                  <p className="text-base font-bold text-text-primary mt-0.5">{formatCurrency(voteTarget.requestedBudget)}</p>
                </div>
                <Banknote size={20} className="text-brand" />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  <MessageSquare size={12} className="inline mr-1" />
                  Nhận xét / Lý do <span className="text-danger">*</span>
                </label>
                <textarea
                  value={voteComment}
                  onChange={(e) => setVoteComment(e.target.value)}
                  placeholder="Nêu ý kiến đánh giá của bạn về đề xuất này..."
                  rows={4}
                  className="w-full bg-bg-surface border border-border-custom rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand resize-none"
                  required
                />
              </div>

              {/* Current vote distribution */}
              <div className="bg-bg-surface border border-border-custom rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-2">Phân bố phiếu hiện tại</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-success font-medium">
                    <CheckCircle size={11} />
                    {voteTarget.voteResults.approve}
                  </span>
                  <span className="flex items-center gap-1 text-danger font-medium">
                    <XCircle size={11} />
                    {voteTarget.voteResults.reject}
                  </span>
                  <span className="flex items-center gap-1 text-text-muted font-medium">
                    <MinusCircle size={11} />
                    {voteTarget.voteResults.abstain}
                  </span>
                  <span className="ml-auto text-text-muted">
                    Tổng: {getTotalVotes(voteTarget)}/{voteTarget.voteResults.total}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border-custom flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVoteModal(false)}
                  className="px-4 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitVoteMutation.isPending}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border-none cursor-pointer transition-all text-white ${
                    submitVoteMutation.isPending
                      ? 'bg-brand/50 cursor-not-allowed'
                      : 'bg-brand hover:bg-brand-hover shadow-brand'
                  }`}
                >
                  {submitVoteMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Vote size={14} />
                  )}
                  Xác nhận biểu quyết
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
