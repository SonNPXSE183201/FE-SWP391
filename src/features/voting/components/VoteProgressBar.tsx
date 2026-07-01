import { CheckCircle, XCircle } from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';

type VoteProgressBarProps = {
  approve: number;
  reject: number;
  boardTotal: number;
  /** Hiển thị gọn trên thẻ danh sách */
  compact?: boolean;
};

const pct = (count: number, total: number) => (total <= 0 ? 0 : (count / total) * 100);

export const VoteProgressBar = ({
  approve,
  reject,
  boardTotal,
  compact = false,
}: VoteProgressBarProps) => {
  const voted = approve + reject;
  const pending = Math.max(0, boardTotal - voted);

  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-24 h-2 bg-bg-surface rounded-full overflow-hidden flex shrink-0 border border-border-custom/60"
          title={`${approve} duyệt · ${reject} từ chối · ${pending} chưa vote`}
        >
          {approve > 0 && (
            <div className="h-full bg-success transition-all duration-500" style={{ width: `${pct(approve, boardTotal)}%` }} />
          )}
          {reject > 0 && (
            <div className="h-full bg-danger transition-all duration-500" style={{ width: `${pct(reject, boardTotal)}%` }} />
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted shrink-0">
          {approve > 0 && (
            <span className="inline-flex items-center gap-0.5 text-success">
              <CheckCircle size={10} />
              {approve}
            </span>
          )}
          {reject > 0 && (
            <span className="inline-flex items-center gap-0.5 text-danger">
              <XCircle size={10} />
              {reject}
            </span>
          )}
          <span className="text-text-muted/80">
            {voted}/{boardTotal}
          </span>
        </div>
        <HelpTip
          content={
            <>
              Thanh hiển thị trên tổng <strong>{boardTotal}</strong> TV HĐ: xanh = Đồng ý, đỏ = Từ chối.
              Phần trống = chưa vote.
            </>
          }
          title="Tiến độ phiếu"
          ariaLabel="Giải thích tiến độ phiếu"
          size="sm"
          placement="top-end"
          width="16rem"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <span>
          {voted}/{boardTotal} TV đã vote
        </span>
        {pending > 0 && <span>{pending} chưa vote</span>}
      </div>
      <div className="w-full h-2.5 bg-bg-surface rounded-full overflow-hidden flex border border-border-custom/60">
        {approve > 0 && (
          <div className="h-full bg-success transition-all duration-500" style={{ width: `${pct(approve, boardTotal)}%` }} />
        )}
        {reject > 0 && (
          <div className="h-full bg-danger transition-all duration-500" style={{ width: `${pct(reject, boardTotal)}%` }} />
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px]">
        <span className="inline-flex items-center gap-1 text-success">
          <CheckCircle size={12} />
          {approve} Đồng ý
        </span>
        <span className="inline-flex items-center gap-1 text-danger">
          <XCircle size={12} />
          {reject} Từ chối
        </span>
      </div>
    </div>
  );
};
