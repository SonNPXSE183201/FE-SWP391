import { useMemo } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import {
  Vote,
  X,
  CheckCircle,
  XCircle,
  MinusCircle,
  MessageSquare,
  Banknote,
  User,
  Sparkles,
  Copy,
} from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { VoteProgressBar } from './VoteProgressBar';
import { BoardSeriesDossier } from './BoardSeriesDossier';
import {
  parseSeriesGenres,
  summarizeBoardVotes,
  type VoteUiChoice,
} from '../voting.utils';
import type { VotingSeriesDto } from '../api/voting.api';
import { getGenreLabel } from '../../series/constants/genres';
import { MANGAKA_ROLE_LABEL, NEMU_BUDGET_LABEL } from '../../series/constants/seriesCopy';

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatVndInput = (value: number): string =>
  value > 0 ? new Intl.NumberFormat('vi-VN').format(value) : '';

const parseVndInput = (raw: string): number => {
  const digits = raw.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
};

const DECISION_OPTIONS: {
  value: VoteUiChoice;
  label: string;
  hint: string;
  icon: typeof CheckCircle;
  selected: string;
  idle: string;
}[] = [
  {
    value: 'Approve',
    label: 'Phê duyệt',
    hint: 'Đồng ý cấp vốn',
    icon: CheckCircle,
    selected: 'border-success/50 bg-success/10 text-success ring-1 ring-success/30',
    idle: 'border-border-custom bg-bg-primary text-text-secondary hover:border-success/30',
  },
  {
    value: 'Reject',
    label: 'Từ chối',
    hint: 'Không duyệt series',
    icon: XCircle,
    selected: 'border-danger/50 bg-danger/10 text-danger ring-1 ring-danger/30',
    idle: 'border-border-custom bg-bg-primary text-text-secondary hover:border-danger/30',
  },
  {
    value: 'Abstain',
    label: 'Bỏ qua',
    hint: 'Không tham gia phe',
    icon: MinusCircle,
    selected: 'border-text-muted/40 bg-bg-surface text-text-primary ring-1 ring-border-custom',
    idle: 'border-border-custom bg-bg-primary text-text-secondary hover:border-border-custom',
  },
];

const COMMENT_PLACEHOLDER: Record<VoteUiChoice, string> = {
  Approve: 'Vì sao bạn đồng ý cấp vốn? Điểm mạnh của đề xuất...',
  Reject: 'Lý do từ chối — rủi ro, ngân sách, nội dung...',
  Abstain: 'Ghi chú ngắn (tuỳ chọn) — vd. cần thêm thông tin...',
};

type VoteModalProps = {
  voteTarget: VotingSeriesDto;
  voteDecision: VoteUiChoice;
  setVoteDecision: (d: VoteUiChoice) => void;
  voteComment: string;
  setVoteComment: (v: string) => void;
  voteBudget: number;
  setVoteBudget: (v: number) => void;
  boardTotal: number;
  approveRequired?: number;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitVoteMutation: Pick<UseMutationResult<unknown, Error, unknown>, 'isPending'>;
};

export const VoteModal = ({
  voteTarget,
  voteDecision,
  setVoteDecision,
  voteComment,
  setVoteComment,
  voteBudget,
  setVoteBudget,
  boardTotal,
  approveRequired,
  onClose,
  onSubmit,
  submitVoteMutation,
}: VoteModalProps) => {
  const authorBudget = voteTarget.estimatedProductionBudget ?? 0;
  const voteResults = summarizeBoardVotes(voteTarget.boardVotes);
  const genres = parseSeriesGenres(voteTarget.genre);
  const coverUrl = voteTarget.coverArtworkUrl ? resolveMediaUrl(voteTarget.coverArtworkUrl) : '';

  const canSubmit = useMemo(() => {
    if (voteDecision === 'Approve' && voteBudget <= 0) return false;
    if (voteDecision === 'Abstain') return true;
    return voteComment.trim().length >= 3;
  }, [voteDecision, voteBudget, voteComment]);

  const decisionLabel = DECISION_OPTIONS.find((o) => o.value === voteDecision)?.label ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-labelledby="vote-modal-title"
        className="relative bg-bg-secondary border border-border-custom rounded-t-2xl sm:rounded-2xl w-full max-w-4xl shadow-2xl animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 sm:p-6 border-b border-border-custom">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="w-14 h-[72px] rounded-lg object-cover border border-border-custom shrink-0"
            />
          ) : (
            <div className="w-14 h-[72px] rounded-lg bg-bg-surface border border-border-custom shrink-0" />
          )}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <Vote size={14} className="text-brand" />
              </div>
              <h3 id="vote-modal-title" className="text-base font-semibold text-text-primary">
                Biểu quyết Series
              </h3>
            </div>
            <p className="text-sm font-medium text-text-primary mt-1 truncate">{voteTarget.title}</p>
            {voteTarget.mangakaName && (
              <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                <User size={11} />
                {voteTarget.mangakaName}
              </p>
            )}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {genres.slice(0, 3).map((g) => (
                  <span key={g} className="px-1.5 py-0.5 rounded text-[10px] bg-brand/10 text-brand">
                    {getGenreLabel(g)}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-5">
          <div className="rounded-xl border border-brand/15 bg-brand/5 p-4">
            <p className="text-xs font-semibold text-text-primary mb-3">Hồ sơ trước khi biểu quyết</p>
            <BoardSeriesDossier series={voteTarget} variant="compact" />
          </div>

          {/* Decision — full width */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-2.5">
              Quyết định biểu quyết <span className="text-danger">*</span>
              <HelpTip
                content="Phê duyệt: đồng ý cấp vốn (nhập ngân sách đề xuất). Từ chối: không duyệt. Bỏ qua: không tính vào phe Đồng ý/Từ chối."
                title="Các lựa chọn"
                ariaLabel="Giải thích quyết định"
                size="sm"
                placement="bottom-start"
                autoCloseMs={0}
              />
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DECISION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = voteDecision === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVoteDecision(opt.value)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border text-center cursor-pointer transition-all ${
                      selected ? opt.selected : opt.idle
                    }`}
                  >
                    <Icon size={20} strokeWidth={selected ? 2.25 : 2} />
                    <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                    <span className="text-[10px] opacity-70 leading-snug">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Left — budget & comment */}
            <div className="space-y-4 min-w-0">
              {voteDecision === 'Approve' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="rounded-xl border border-border-custom bg-bg-primary p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                        {NEMU_BUDGET_LABEL} ({MANGAKA_ROLE_LABEL})
                      </p>
                      <p className="text-lg font-bold text-text-primary mt-0.5">{formatCurrency(authorBudget)}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                      <Banknote size={18} className="text-brand" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className="text-xs font-medium text-text-secondary">
                        Ngân sách bạn đề xuất cấp <span className="text-danger">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setVoteBudget(authorBudget)}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-brand hover:text-brand-hover bg-transparent border-none cursor-pointer"
                      >
                        <Copy size={11} />
                        Dùng mức tác giả
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">₫</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatVndInput(voteBudget)}
                        onChange={(e) => setVoteBudget(parseVndInput(e.target.value))}
                        className="w-full bg-bg-primary border border-border-custom rounded-xl pl-8 pr-4 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 transition-colors"
                        placeholder="0"
                      />
                    </div>
                    {voteBudget > 0 && voteBudget !== authorBudget && (
                      <p className="text-[11px] text-text-muted mt-1.5">
                        {voteBudget > authorBudget ? (
                          <span className="text-amber-400">
                            Cao hơn yêu cầu {(voteBudget - authorBudget).toLocaleString('vi-VN')} ₫
                          </span>
                        ) : (
                          <span className="text-success">
                            Thấp hơn yêu cầu {(authorBudget - voteBudget).toLocaleString('vi-VN')} ₫
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center justify-between gap-2 text-xs font-medium text-text-secondary mb-1.5">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare size={12} />
                    Nhận xét / Lý do
                    {voteDecision !== 'Abstain' && <span className="text-danger">*</span>}
                  </span>
                  <span className="text-[10px] text-text-muted font-normal">{voteComment.length}/500</span>
                </label>
                <textarea
                  value={voteComment}
                  onChange={(e) => setVoteComment(e.target.value.slice(0, 500))}
                  placeholder={COMMENT_PLACEHOLDER[voteDecision]}
                  rows={voteDecision === 'Approve' ? 3 : 4}
                  className="w-full bg-bg-primary border border-border-custom rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 resize-none leading-relaxed"
                  required={voteDecision !== 'Abstain'}
                />
              </div>
            </div>

            {/* Right — progress & summary */}
            <div className="space-y-4 min-w-0 flex flex-col">
              <div className="rounded-xl border border-border-custom bg-bg-primary/60 p-4 space-y-3 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-text-secondary">Tiến độ phiếu Hội đồng</p>
                  {approveRequired != null && boardTotal > 0 && (
                    <span className="text-[10px] text-text-muted whitespace-nowrap">
                      Cần ≥{approveRequired}/{boardTotal} để duyệt
                    </span>
                  )}
                </div>
                <VoteProgressBar
                  approve={voteResults.approve}
                  reject={voteResults.reject}
                  abstain={voteResults.abstain}
                  boardTotal={boardTotal || 1}
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-brand/5 border border-brand/15 px-4 py-3 text-[11px] text-text-secondary leading-relaxed">
                <Sparkles size={14} className="text-brand shrink-0 mt-0.5" />
                <span>
                  Bạn sắp gửi phiếu <strong className="text-text-primary">{decisionLabel}</strong>
                  {voteDecision === 'Approve' && voteBudget > 0 && (
                    <> với ngân sách <strong className="text-success">{formatCurrency(voteBudget)}</strong></>
                  )}
                  . Không thể sửa sau khi xác nhận.
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-border-custom">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-bg-primary border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitVoteMutation.isPending || !canSubmit}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all text-white ${
                submitVoteMutation.isPending || !canSubmit
                  ? 'bg-brand/40 cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-hover'
              }`}
            >
              {submitVoteMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Vote size={15} />
              )}
              Xác nhận biểu quyết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
