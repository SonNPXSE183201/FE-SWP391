import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { HelpTip } from '../../../components/common/HelpTip';

type VoteProgressBarProps = {
  approve: number;
  reject: number;
  boardTotal: number;
  /** Hiển thị gọn trên thẻ danh sách */
  compact?: boolean;
};

const pct = (count: number, total: number) => (total <= 0 ? 0 : (count / total) * 100);

const StatCard = ({
  icon: Icon,
  label,
  count,
  percent,
  tone,
}: {
  icon: typeof CheckCircle;
  label: string;
  count: number;
  percent?: number;
  tone: 'success' | 'danger' | 'muted';
}) => {
  const tones = {
    success: {
      wrap: 'border-success/20 bg-success/[0.06]',
      icon: 'text-success',
      count: 'text-success',
      label: 'text-success/80',
    },
    danger: {
      wrap: 'border-danger/20 bg-danger/[0.06]',
      icon: 'text-danger',
      count: 'text-danger',
      label: 'text-danger/80',
    },
    muted: {
      wrap: 'border-border-custom bg-bg-primary/60',
      icon: 'text-text-muted',
      count: 'text-text-secondary',
      label: 'text-text-muted',
    },
  }[tone];

  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 ${tones.wrap}`}>
      <Icon size={15} className={tones.icon} />
      <p className={`text-xl font-bold tabular-nums leading-none ${tones.count}`}>{count}</p>
      <p className={`text-[11px] font-medium ${tones.label}`}>{label}</p>
      {percent != null && percent > 0 && (
        <p className="text-[10px] text-text-muted tabular-nums">{percent}% HĐ</p>
      )}
    </div>
  );
};

export const VoteProgressBar = ({
  approve,
  reject,
  boardTotal,
  compact = false,
}: VoteProgressBarProps) => {
  const voted = approve + reject;
  const pending = Math.max(0, boardTotal - voted);
  const participationPct = Math.round(pct(voted, boardTotal));
  const approvePct = Math.round(pct(approve, boardTotal));
  const rejectPct = Math.round(pct(reject, boardTotal));

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-28 h-2 bg-bg-surface rounded-full overflow-hidden flex shrink-0 border border-border-custom/60"
          role="img"
          aria-label={`${approve} phê duyệt, ${reject} từ chối, ${pending} chưa bỏ phiếu`}
        >
          {approve > 0 && (
            <div
              className="h-full bg-success transition-all duration-500"
              style={{ width: `${pct(approve, boardTotal)}%` }}
            />
          )}
          {reject > 0 && (
            <div
              className="h-full bg-danger transition-all duration-500"
              style={{ width: `${pct(reject, boardTotal)}%` }}
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] shrink-0 tabular-nums">
          {approve > 0 && (
            <span className="inline-flex items-center gap-0.5 text-success font-medium">
              <CheckCircle size={10} />
              {approve}
            </span>
          )}
          {reject > 0 && (
            <span className="inline-flex items-center gap-0.5 text-danger font-medium">
              <XCircle size={10} />
              {reject}
            </span>
          )}
          <span className="text-text-muted">
            {voted}/{boardTotal}
          </span>
        </div>
        <HelpTip
          content={
            <>
              Thanh trên tổng <strong>{boardTotal}</strong> TV HĐ: xanh = Phê duyệt, đỏ = Từ chối, phần trống = chưa
              bỏ phiếu.
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
    <div className="space-y-4">
      {/* Participation summary */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0 w-14 h-14" aria-hidden>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-bg-surface"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${participationPct} ${100 - participationPct}`}
              className="text-brand transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary tabular-nums">
            {participationPct}%
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary tabular-nums">
            {voted}/{boardTotal} thành viên đã bỏ phiếu
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {pending > 0 ? (
              <>
                Còn <span className="text-text-secondary font-medium">{pending}</span> TV chưa phản hồi
              </>
            ) : (
              <span className="text-success">Tất cả TV đã bỏ phiếu</span>
            )}
          </p>
        </div>
      </div>

      {/* Stacked distribution bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-text-muted font-medium">
          <span>Phân bổ phiếu</span>
          <span className="normal-case tracking-normal font-normal">
            {boardTotal} TV HĐ
          </span>
        </div>
        <div
          className="w-full h-3 bg-bg-surface rounded-full overflow-hidden flex border border-border-custom/60"
          role="img"
          aria-label={`Phê duyệt ${approve}, Từ chối ${reject}, Chưa bỏ phiếu ${pending}`}
        >
          {approve > 0 && (
            <div
              className="h-full bg-success transition-all duration-500"
              style={{ width: `${pct(approve, boardTotal)}%` }}
            />
          )}
          {reject > 0 && (
            <div
              className="h-full bg-danger transition-all duration-500"
              style={{ width: `${pct(reject, boardTotal)}%` }}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
          {approve > 0 && (
            <span className="inline-flex items-center gap-1.5 text-success">
              <span className="w-2 h-2 rounded-full bg-success shrink-0" />
              Phê duyệt · {approvePct}%
            </span>
          )}
          {reject > 0 && (
            <span className="inline-flex items-center gap-1.5 text-danger">
              <span className="w-2 h-2 rounded-full bg-danger shrink-0" />
              Từ chối · {rejectPct}%
            </span>
          )}
          {pending > 0 && (
            <span className="inline-flex items-center gap-1.5 text-text-muted">
              <span className="w-2 h-2 rounded-full bg-bg-surface border border-border-custom shrink-0" />
              Chưa bỏ phiếu · {Math.round(pct(pending, boardTotal))}%
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={CheckCircle}
          label="Phê duyệt"
          count={approve}
          percent={approvePct}
          tone="success"
        />
        <StatCard
          icon={XCircle}
          label="Từ chối"
          count={reject}
          percent={rejectPct}
          tone="danger"
        />
        <StatCard icon={Clock} label="Chưa vote" count={pending} tone="muted" />
      </div>
    </div>
  );
};
