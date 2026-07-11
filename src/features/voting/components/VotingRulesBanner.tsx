import { BarChart3, Clock, Crown, Users, AlertTriangle } from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';
import type { BoardVotingRulesDto } from '../../admin/api/boardVoting.api';
import { calcEffectiveThresholdPercent } from '../utils/voting.utils';

type VotingRulesBannerProps = {
  rules: BoardVotingRulesDto;
};

export const VotingRulesBanner = ({ rules }: VotingRulesBannerProps) => {
  const n = rules.boardMemberCount;
  const totalWeight = rules.totalWeight ?? n;
  const chairWeight = rules.chairWeight ?? 1;
  const approveEffective = calcEffectiveThresholdPercent(rules.approveRequired, totalWeight);

  return (
    <div className="rounded-xl border border-border-custom bg-bg-secondary">
      <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <BarChart3 size={18} className="text-brand" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-text-primary">Quy tắc biểu quyết hiện tại</h2>
              <HelpTip
                title="Chi tiết quy tắc"
                ariaLabel="Xem chi tiết quy tắc biểu quyết"
                placement="bottom-start"
                width="22rem"
                autoCloseMs={0}
                content={
                  <ul className="space-y-2 list-none m-0 p-0">
                    <li>
                      <strong className="text-success">Duyệt cấp vốn:</strong> cần ≥{rules.approveRequired}/
                      {totalWeight} trọng số phiếu Đồng ý ({rules.approvalThresholdPercent}%).
                    </li>
                    <li>
                      <strong className="text-text-secondary">Trọng số:</strong> Chủ tịch HĐ = {chairWeight} phiếu,
                      TV thường = 1 phiếu. Tổng trọng số luôn lẻ → không hòa phiếu.
                    </li>
                    <li>
                      <strong className="text-text-secondary">Ngân sách duyệt:</strong> trung bình có trọng số
                      các mức đề xuất từ phiếu Approve.
                    </li>
                    <li>
                      <strong className="text-text-secondary">Tự chốt:</strong> sau {rules.autoResolveHours} giờ —
                      phe Đồng ý nhiều hơn thì duyệt, ngược lại từ chối.
                    </li>
                  </ul>
                }
              />
            </div>
            <p className="text-[11px] text-text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="inline-flex items-center gap-1">
                <Users size={11} />
                {n} thành viên HĐ
              </span>
              <span className="inline-flex items-center gap-1">
                <Crown size={11} />
                Chủ tịch = {chairWeight} phiếu
                {rules.chairUserName ? ` (${rules.chairUserName})` : ''}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                Tự chốt {rules.autoResolveHours}h
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-success/10 text-success font-medium border border-success/15">
            Duyệt ≥{rules.approveRequired}/{totalWeight}
            <span className="text-success/70 font-normal">
              ({rules.approvalThresholdPercent}%
              {approveEffective !== rules.approvalThresholdPercent ? ` → ≥${approveEffective}%` : ''})
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-bg-primary text-text-muted font-medium border border-border-custom">
            Tổng trọng số: {totalWeight}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-bg-primary text-text-muted font-medium border border-border-custom">
            <Clock size={11} />
            {rules.autoResolveHours}h
          </span>
        </div>
      </div>

      {rules.chairIsValid === false && rules.chairInvalidWarning && (
        <div className="flex items-start gap-2 px-4 py-2.5 bg-amber-500/8 border-t border-amber-500/15 text-[11px] text-amber-300">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <span>{rules.chairInvalidWarning}</span>
        </div>
      )}
    </div>
  );
};
