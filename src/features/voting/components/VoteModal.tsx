import { useMemo } from 'react';

import type { UseMutationResult } from '@tanstack/react-query';

import {

  Vote,

  X,

  CheckCircle,

  XCircle,

  MessageSquare,

  Banknote,

  Sparkles,

  Copy,

} from 'lucide-react';

import { HelpTip } from '../../../components/common/HelpTip';

import { VoteProgressBar } from './VoteProgressBar';



import {

  summarizeBoardVotes,

  isRecommendedBudgetInRange,

  getRecommendedBudgetRange,

  type VoteUiChoice,

} from '../voting.utils';

import { formatVND, formatVNDInput } from '../../../utils/currency';

import type { VotingSeriesDto } from '../api/voting.api';

import { MANGAKA_ROLE_LABEL, NEMU_BUDGET_LABEL } from '../../series/constants/seriesCopy';



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

];



const COMMENT_PLACEHOLDER: Record<VoteUiChoice, string> = {

  Approve: 'Vì sao bạn đồng ý cấp vốn? Điểm mạnh của đề xuất...',

  Reject: 'Lý do từ chối — rủi ro, ngân sách, nội dung...',

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

  totalWeight?: number;

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

  totalWeight,

  onClose,

  onSubmit,

  submitVoteMutation,

}: VoteModalProps) => {

  const authorBudget = voteTarget.estimatedProductionBudget ?? 0;

  const editorBudget = voteTarget.editorRecommendedBudget ?? 0;

  const voteResults = summarizeBoardVotes(voteTarget.boardVotes);

  const budgetRange = getRecommendedBudgetRange(authorBudget);

  const budgetOutOfRange =

    voteDecision === 'Approve' &&

    voteBudget > 0 &&

    authorBudget > 0 &&

    !isRecommendedBudgetInRange(voteBudget, authorBudget);



  const canSubmit = useMemo(() => {

    if (voteDecision === 'Approve') {

      if (voteBudget <= 0) return false;

      if (authorBudget > 0 && !isRecommendedBudgetInRange(voteBudget, authorBudget)) return false;

    }

    return voteComment.trim().length >= 3;

  }, [voteDecision, voteBudget, voteComment, authorBudget]);



  const decisionLabel = DECISION_OPTIONS.find((o) => o.value === voteDecision)?.label ?? '';

  const weightDenominator = totalWeight ?? boardTotal;



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">

      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div

        role="dialog"

        aria-labelledby="vote-modal-title"

        className="relative bg-bg-secondary border border-border-custom rounded-t-2xl sm:rounded-2xl w-full max-w-4xl shadow-2xl animate-fade-in flex flex-col max-h-full overflow-hidden"

      >

        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border-custom shrink-0">

          <div className="flex items-center gap-2">

            <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">

              <Vote size={14} className="text-brand" />

            </div>

            <h3 id="vote-modal-title" className="text-base font-semibold text-text-primary">

              Biểu quyết Series

            </h3>

          </div>

          <button

            type="button"

            onClick={onClose}

            className="p-2 -mr-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer shrink-0"

            aria-label="Đóng"

          >

            <X size={18} />

          </button>

        </div>



        <form onSubmit={onSubmit} className="flex flex-col min-h-0 overflow-hidden">

          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">

          <div>

            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-2.5">

              Quyết định biểu quyết <span className="text-danger">*</span>

              <HelpTip

                content="Phê duyệt: đồng ý cấp vốn (nhập ngân sách đề xuất). Từ chối: không duyệt series."

                title="Các lựa chọn"

                ariaLabel="Giải thích quyết định"

                size="sm"

                placement="bottom-start"

                autoCloseMs={0}

              />

            </label>

            <div className="grid grid-cols-2 gap-3">

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

            <div className="space-y-4 min-w-0">

              {voteDecision === 'Approve' && (

                <div className="space-y-3 animate-fade-in">

                  <div className="rounded-xl border border-border-custom bg-bg-primary p-4 space-y-3">

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">

                          {NEMU_BUDGET_LABEL} ({MANGAKA_ROLE_LABEL})

                        </p>

                        <p className="text-lg font-bold text-text-primary mt-0.5">{formatVND(authorBudget)}</p>

                      </div>

                      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">

                        <Banknote size={18} className="text-brand" />

                      </div>

                    </div>

                    {editorBudget > 0 && (

                      <div className="pt-3 border-t border-border-custom">

                        <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">

                          Editor đề xuất

                        </p>

                        <p className="text-base font-semibold text-amber-400 mt-0.5">{formatVND(editorBudget)}</p>

                      </div>

                    )}

                  </div>



                  <div>

                    <div className="flex items-center justify-between gap-2 mb-1.5">

                      <label className="text-xs font-medium text-text-secondary">

                        Ngân sách bạn đề xuất cấp <span className="text-danger">*</span>

                      </label>

                      <button

                        type="button"

                        onClick={() => setVoteBudget(editorBudget > 0 ? editorBudget : authorBudget)}

                        className="inline-flex items-center gap-1 text-[10px] font-medium text-brand hover:text-brand-hover bg-transparent border-none cursor-pointer"

                      >

                        <Copy size={11} />

                        {editorBudget > 0 ? 'Dùng mức Editor' : 'Dùng mức tác giả'}

                      </button>

                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatVNDInput(voteBudget)}
                        onChange={(e) => setVoteBudget(parseVndInput(e.target.value))}
                        className="w-full bg-bg-primary border border-border-custom rounded-xl pl-4 pr-12 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 transition-colors"
                        placeholder="0"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted font-medium pointer-events-none">VND</span>
                    </div>

                    {authorBudget > 0 && (

                      <p className="text-[11px] text-text-muted mt-1.5">

                        Cho phép: {formatVND(budgetRange.min)} – {formatVND(budgetRange.max)} (50%–150%)

                      </p>

                    )}

                    {budgetOutOfRange && (

                      <p className="text-[11px] text-danger mt-1">

                        Ngân sách nằm ngoài khoảng cho phép. Vui lòng kiểm tra lại.

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

                    <span className="text-danger">*</span>

                  </span>

                  <span className="text-[10px] text-text-muted font-normal">{voteComment.length}/500</span>

                </label>

                <textarea

                  value={voteComment}

                  onChange={(e) => setVoteComment(e.target.value.slice(0, 500))}

                  placeholder={COMMENT_PLACEHOLDER[voteDecision]}

                  rows={voteDecision === 'Approve' ? 3 : 4}

                  className="w-full bg-bg-primary border border-border-custom rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 resize-none leading-relaxed"

                  required

                />

              </div>

            </div>



            <div className="space-y-4 min-w-0 flex flex-col">

              <div className="rounded-xl border border-border-custom bg-bg-primary/60 p-4 space-y-3 flex-1">

                <div className="flex items-center justify-between gap-2">

                  <p className="text-xs font-medium text-text-secondary">Tiến độ phiếu Hội đồng</p>

                  {approveRequired != null && weightDenominator > 0 && (

                    <span className="text-[10px] text-text-muted whitespace-nowrap">

                      Cần ≥{approveRequired}/{weightDenominator} trọng số để duyệt

                    </span>

                  )}

                </div>

                <VoteProgressBar

                  approve={voteResults.approve}

                  reject={voteResults.reject}

                  boardTotal={boardTotal || 1}

                />

              </div>



              <div className="flex items-start gap-2 rounded-xl bg-brand/5 border border-brand/15 px-4 py-3 text-[11px] text-text-secondary leading-relaxed">

                <Sparkles size={14} className="text-brand shrink-0 mt-0.5" />

                <span>

                  Bạn sắp gửi phiếu <strong className="text-text-primary">{decisionLabel}</strong>

                  {voteDecision === 'Approve' && voteBudget > 0 && (

                    <> với ngân sách <strong className="text-success">{formatVND(voteBudget)}</strong></>

                  )}

                  . Không thể sửa sau khi xác nhận.

                </span>

              </div>

            </div>

          </div>



          </div>



          <div className="p-4 sm:px-6 sm:py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border-custom shrink-0 bg-bg-secondary">

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


