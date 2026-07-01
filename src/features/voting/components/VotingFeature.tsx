import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Vote,
  Eye,
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
  Clock,
  ImagePlus,
  BarChart3,
  Inbox,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useVotingList, useSubmitBoardVote } from '../hooks/useVoting';
import type { VotingSeriesDto } from '../api/voting.api';
import { getGenreLabel } from '../../series/constants/genres';
import { MANGAKA_PROPOSED_LABEL, NEMU_BUDGET_LABEL } from '../../series/constants/seriesCopy';
import { HelpTip } from '../../../components/common/HelpTip';
import { showAppSuccess, showAppError } from '../../../utils/appToast';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { VoteProgressBar } from './VoteProgressBar';
import { VotingRulesBanner } from './VotingRulesBanner';
import { VoteModal } from './VoteModal';
import { BoardSeriesDossier } from './BoardSeriesDossier';
import { hasBoardSeriesDossier } from '../utils/boardSeriesDossier';
import {
  boardVoteToUiChoice,
  findMyBoardVote,
  getSeriesIdString,
  getVotingUiStatus,
  parseSeriesGenres,
  summarizeBoardVotes,
  uiChoiceToVoteSeriesRequest,
  type VoteUiChoice,
  type VotingListFilter,
} from '../voting.utils';

const FILTER_TABS: { value: VotingListFilter; label: string }[] = [
  { value: 'All', label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ biểu quyết' },
  { value: 'Voted', label: 'Đã bỏ phiếu' },
  { value: 'Closed', label: 'Đã đóng' },
];

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const getVoteDecisionConfig = (decision: VoteUiChoice) => {
  switch (decision) {
    case 'Approve':
      return { label: 'Phê duyệt', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle };
    case 'Reject':
      return { label: 'Từ chối', color: 'text-danger', bg: 'bg-danger/10', icon: XCircle };
  }
};

const getStatusBadge = (series: VotingSeriesDto, boardMemberId?: number | string | null) => {
  const status = getVotingUiStatus(series, boardMemberId);
  const myVote = boardVoteToUiChoice(findMyBoardVote(series.boardVotes, boardMemberId));
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
  const boardMemberId = useAuthStore((s) => s.user?.id);
  const [filter, setFilter] = useState<VotingListFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<VotingSeriesDto | null>(null);

  // Vote modal
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteTarget, setVoteTarget] = useState<VotingSeriesDto | null>(null);
  const [voteDecision, setVoteDecision] = useState<VoteUiChoice>('Approve');
  const [voteComment, setVoteComment] = useState('');
  const [voteBudget, setVoteBudget] = useState<number>(0);

  const { data: votingData, isLoading } = useVotingList(filter);
  const votingList = votingData?.series ?? [];
  const votingRules = votingData?.rules;
  const boardTotal = votingRules?.boardMemberCount ?? 0;
  const submitVoteMutation = useSubmitBoardVote();

  const stats = useMemo(() => {
    let pending = 0;
    let voted = 0;
    for (const item of votingList) {
      const status = getVotingUiStatus(item, boardMemberId);
      if (status === 'Pending') pending += 1;
      else if (status === 'Voted') voted += 1;
    }
    return { pending, voted, total: votingList.length };
  }, [votingList, boardMemberId]);

  const filteredList = useMemo(
    () =>
      votingList.filter(
        (item) =>
          (item.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.mangakaName ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [votingList, searchQuery],
  );

  const handleOpenVoteModal = (item: VotingSeriesDto) => {
    setVoteTarget(item);
    setVoteDecision('Approve');
    setVoteComment('');
    setVoteBudget(item.estimatedProductionBudget ?? 0);
    setShowVoteModal(true);
  };

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voteTarget) return;

    try {
      await submitVoteMutation.mutateAsync({
        seriesId: getSeriesIdString(voteTarget),
        body: uiChoiceToVoteSeriesRequest(voteDecision, voteComment, voteBudget),
      });
      showAppSuccess(`Bỏ phiếu "${getVoteDecisionConfig(voteDecision).label}" cho "${voteTarget.title}" thành công!`);
      setShowVoteModal(false);
      setSelectedItem(null);
    } catch {
      showAppError('Gửi phiếu thất bại. Vui lòng thử lại.');
    }
  };

  const getVoteResults = (item: VotingSeriesDto) => summarizeBoardVotes(item.boardVotes);

  const getTotalVotes = (item: VotingSeriesDto) => {
    const r = getVoteResults(item);
    return r.approve + r.reject;
  };

  const getVoteDenominator = () => boardTotal || 1;

  const getPercentage = (count: number, total: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100);
  // ── Detail View ──
  if (selectedItem) {
    const totalVotes = getTotalVotes(selectedItem);
    const voteResults = getVoteResults(selectedItem);
    const genres = parseSeriesGenres(selectedItem.genre);
    const uiStatus = getVotingUiStatus(selectedItem, boardMemberId);
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
          {getStatusBadge(selectedItem, boardMemberId)}
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
                  {selectedItem.coverArtworkUrl ? (
                    <img src={resolveMediaUrl(selectedItem.coverArtworkUrl)} alt={selectedItem.title ?? ''} className="w-full h-full object-cover" />
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
                    {genres.map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium">{getGenreLabel(g)}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>Gửi: {selectedItem.createAt ? new Date(selectedItem.createAt).toLocaleDateString('vi-VN') : '—'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>Hạn: {selectedItem.updateAt ? new Date(selectedItem.updateAt).toLocaleDateString('vi-VN') : '—'}</span>
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
                <h2 className="text-sm font-semibold text-text-primary">{NEMU_BUDGET_LABEL}</h2>
              </div>
              <div className="bg-bg-surface border border-border-custom rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1">{MANGAKA_PROPOSED_LABEL}</p>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(selectedItem.estimatedProductionBudget ?? 0)}</p>
              </div>
            </div>

            {/* Hồ sơ trình Hội đồng — bản phác thảo + nhận xét */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Hồ sơ trình Hội đồng</h2>
                <HelpTip
                  content="Gồm file bản phác thảo Mangaka nộp và nhận xét Editor khi trình lên Hội đồng. Nên đọc trước khi bỏ phiếu."
                  title="Hồ sơ biểu quyết"
                  ariaLabel="Giải thích hồ sơ trình Hội đồng"
                  size="sm"
                />
              </div>
              <BoardSeriesDossier series={selectedItem} />
            </div>
          </div>

          {/* RIGHT: Vote Results + Actions */}
          <div className="lg:col-span-2 space-y-5">
            {/* Vote Distribution */}
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-brand" />
                <h2 className="text-sm font-semibold text-text-primary">Kết quả biểu quyết</h2>
                <HelpTip
                  content="Xanh = Phê duyệt, đỏ = Từ chối, xám = Bỏ qua. Số phiếu / tổng thành viên Hội đồng được phân công."
                  title="Cách đọc biểu đồ"
                  ariaLabel="Giải thích kết quả biểu quyết"
                  size="sm"
                />
                <span className="ml-auto text-xs text-text-muted">
                  {totalVotes}/{getVoteDenominator()} TV đã vote
                </span>
              </div>
              <VoteProgressBar
                approve={voteResults.approve}
                reject={voteResults.reject}
                boardTotal={getVoteDenominator()}
              />
              <div className="space-y-3 pt-2 border-t border-border-custom/60">
                {/* Approve bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-success font-medium">
                      <CheckCircle size={12} />
                      Phê duyệt
                    </div>
                    <span className="text-xs font-bold text-success">
                      {voteResults.approve} ({getPercentage(voteResults.approve, getVoteDenominator())}% HĐ)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(voteResults.approve, getVoteDenominator())}%` }}
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
                    <span className="text-xs font-bold text-danger">
                      {voteResults.reject} ({getPercentage(voteResults.reject, getVoteDenominator())}% HĐ)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-danger rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(voteResults.reject, getVoteDenominator())}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            {uiStatus === 'Pending' && (
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
        
        {/* Modal Needs to be here too for Detail View */}
        {showVoteModal && voteTarget && createPortal(
          <VoteModal
            voteTarget={voteTarget}
            voteDecision={voteDecision}
            setVoteDecision={setVoteDecision}
            voteComment={voteComment}
            setVoteComment={setVoteComment}
            voteBudget={voteBudget}
            setVoteBudget={setVoteBudget}
            boardTotal={boardTotal || 6}
            approveRequired={votingRules?.approveRequired}
            totalWeight={votingRules?.totalWeight}
            onClose={() => setShowVoteModal(false)}
            onSubmit={handleVoteSubmit}
            submitVoteMutation={submitVoteMutation}
          />,
          document.body
        )}
      </div>
    );
  }

  // ── Main List View ──
  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Vote size={20} className="text-brand" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="page-header__title">Biểu quyết Series</h1>
            <HelpTip
              content="Editor đã trình hồ sơ lên Hội đồng. Xem chi tiết, chọn Phê duyệt / Từ chối / Bỏ qua và ghi nhận xét. Khi Phê duyệt, bạn có thể điều chỉnh ngân sách cấp phát."
              title="Hướng dẫn biểu quyết"
              ariaLabel="Giải thích trang biểu quyết"
              placement="bottom-start"
              width="20rem"
            />
          </div>
        </div>
      </div>

      {votingRules && <VotingRulesBanner rules={votingRules} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-bg-secondary border border-border-custom rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary leading-none tabular-nums">{stats.pending}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Chờ bạn bỏ phiếu</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary leading-none tabular-nums">{stats.voted}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Bạn đã bỏ phiếu</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-surface text-text-muted flex items-center justify-center shrink-0 border border-border-custom">
            <Inbox size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary leading-none tabular-nums">{stats.total}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Đề xuất đang mở</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm series hoặc tác giả..."
              className="w-full pl-9 pr-4 py-2.5 bg-bg-primary border border-border-custom rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-all ${
                  filter === tab.value
                    ? 'bg-brand/10 text-brand border-brand/30'
                    : 'bg-bg-primary text-text-muted border-border-custom hover:text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center rounded-xl border border-dashed border-border-custom bg-bg-primary/40">
            <div className="w-12 h-12 rounded-xl bg-bg-surface flex items-center justify-center mb-3">
              <Inbox size={22} className="text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-primary">Không có đề xuất phù hợp</p>
            <p className="text-xs text-text-muted mt-1 max-w-sm">
              Series chỉ xuất hiện sau khi Editor trình lên Hội đồng. Thử đổi bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((item) => {
              const voteResults = getVoteResults(item);
              const genres = parseSeriesGenres(item.genre);
              const uiStatus = getVotingUiStatus(item, boardMemberId);
              const coverUrl = item.coverArtworkUrl ? resolveMediaUrl(item.coverArtworkUrl) : '';

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border-custom bg-bg-primary/50 p-4 hover:border-brand/30 hover:bg-brand/[0.02] transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-[72px] h-[96px] rounded-lg overflow-hidden bg-bg-surface shrink-0 border border-border-custom mx-auto sm:mx-0">
                      {coverUrl ? (
                        <img src={coverUrl} alt={item.title ?? ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <ImagePlus size={22} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-text-primary truncate">{item.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-text-muted">
                            <span className="inline-flex items-center gap-1">
                              <User size={11} />
                              {item.mangakaName}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={11} />
                              {item.createAt ? new Date(item.createAt).toLocaleDateString('vi-VN') : '—'}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(item, boardMemberId)}
                      </div>

                      {genres.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {genres.map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium"
                            >
                              {getGenreLabel(g)}
                            </span>
                          ))}
                        </div>
                      )}

                      {hasBoardSeriesDossier(item) && (
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-brand font-medium">
                          <FileText size={11} />
                          Có bản phác thảo / nhận xét Editor
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-border-custom/60">
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-primary">
                          <Banknote size={14} className="text-brand" />
                          {formatCurrency(item.estimatedProductionBudget ?? 0)}
                        </div>
                        <VoteProgressBar
                          approve={voteResults.approve}
                          reject={voteResults.reject}
                          boardTotal={getVoteDenominator()}
                          compact
                        />
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0 justify-end sm:justify-center">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-bg-surface border border-border-custom text-text-secondary hover:text-text-primary hover:border-brand/25 transition-all cursor-pointer flex-1 sm:flex-none"
                      >
                        <Eye size={14} />
                        Chi tiết
                      </button>
                      {uiStatus === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleOpenVoteModal(item)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-brand hover:bg-brand-hover text-white border-none cursor-pointer flex-1 sm:flex-none"
                        >
                          <Vote size={14} />
                          Bỏ phiếu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Vote Modal ─── */}
      {showVoteModal && voteTarget && createPortal(
        <VoteModal
          voteTarget={voteTarget}
          voteDecision={voteDecision}
          setVoteDecision={setVoteDecision}
          voteComment={voteComment}
          setVoteComment={setVoteComment}
          voteBudget={voteBudget}
          setVoteBudget={setVoteBudget}
          boardTotal={boardTotal || 6}
          approveRequired={votingRules?.approveRequired}
          totalWeight={votingRules?.totalWeight}
          onClose={() => setShowVoteModal(false)}
          onSubmit={handleVoteSubmit}
          submitVoteMutation={submitVoteMutation}
        />,
        document.body,
      )}
    </div>
  );
};
