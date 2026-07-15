import { useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  FileSignature,
  Loader2,
  ScrollText,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import { AnimatedModal } from '../../../components/common/animation';

const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatDate = (value?: string | null) => {
  if (!value) return 'Chưa ký';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa ký';
  return date.toLocaleDateString('vi-VN');
};

const getContractStatusLabel = (status?: string | null) => {
  const normalized = (status ?? '').trim().toLowerCase();
  if (normalized === 'signed') return 'Đã ký';
  if (normalized === 'pending') return 'Chờ tác giả ký';
  if (normalized === 'active') return 'Đang hiệu lực';
  return 'Chờ tác giả ký';
};

interface AcceptFundPanelProps {
  estimatedBudget: number;
  approvedBudget: number;
  workflowStatus?: string | null;
  hasContract: boolean;
  contractId?: number | null;
  contractStatus?: string | null;
  baseGenkouryoPrice?: number | null;
  contractSignedDate?: string | null;
  isAccepting: boolean;
  isDeclining: boolean;
  isSigning: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onSign: () => void;
}

export const AcceptFundPanel = ({
  estimatedBudget,
  approvedBudget,
  workflowStatus,
  hasContract,
  contractId,
  contractStatus,
  baseGenkouryoPrice,
  contractSignedDate,
  isAccepting,
  isDeclining,
  isSigning,
  onAccept,
  onDecline,
  onSign,
}: AcceptFundPanelProps) => {
  const diff = approvedBudget - estimatedBudget;
  const busy = isAccepting || isDeclining || isSigning;
  const hasConfirmedFund = workflowStatus === 'Fund_Pending';
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  const handleConfirmDecline = () => {
    setShowDeclineModal(false);
    onDecline();
  };

  const handleConfirmSign = () => {
    setShowSignModal(false);
    onSign();
  };

  return (
    <div className="bg-bg-secondary border border-success/20 rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Banknote size={16} className="text-success" />
        <h2 className="text-sm font-semibold text-text-primary">Gói vốn đã được Hội đồng duyệt</h2>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">
        Hội đồng đã chốt số vốn thực tế NXB dự kiến cấp. Nếu đồng ý mức vốn này, hồ sơ mới được chuyển sang Admin để lập hợp đồng.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border-custom bg-bg-primary p-4">
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Bạn đề xuất</p>
          <p className="text-lg font-bold text-text-primary mt-1">{formatVnd(estimatedBudget)}</p>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <p className="text-[10px] uppercase tracking-wider text-success font-medium">Hội đồng duyệt</p>
          <p className="text-lg font-bold text-success mt-1">{formatVnd(approvedBudget)}</p>
          {diff !== 0 && (
            <p className={`text-[11px] mt-1 ${diff > 0 ? 'text-success' : 'text-amber-400'}`}>
              {diff > 0 ? `Cao hơn ${formatVnd(diff)}` : `Thấp hơn ${formatVnd(Math.abs(diff))}`}
            </p>
          )}
        </div>
      </div>

      {!hasContract ? (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0">
              <ScrollText size={18} className="text-info" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                {hasConfirmedFund ? 'Đã xác nhận mức vốn' : 'Chưa lập hợp đồng'}
              </p>
              <p className="text-sm text-text-secondary leading-snug">
                {hasConfirmedFund
                  ? 'Hồ sơ đã được chuyển sang Admin. Vui lòng chờ Admin lập hợp đồng để xem và xác nhận ký kết.'
                  : 'Sau khi bạn xác nhận mức vốn, Admin mới thấy hồ sơ này trong danh sách chờ lập hợp đồng.'}
              </p>
            </div>
          </div>

          {!hasConfirmedFund && (
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDeclineModal(true)}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-danger/30 bg-danger/5 text-danger cursor-pointer hover:bg-danger/10 transition-all disabled:opacity-50"
              >
                {isDeclining ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Từ chối
              </button>
              <button
                type="button"
                onClick={onAccept}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border-none bg-success text-white cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAccepting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {isAccepting ? 'Đang xử lý...' : 'Xác nhận mức vốn'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-border-custom bg-bg-primary p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileSignature size={16} className="text-brand" />
            <h3 className="text-sm font-semibold text-text-primary">Hợp đồng chờ xác nhận ký kết</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Mã hợp đồng</p>
              <p className="font-semibold text-text-primary mt-1">#{contractId ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Trạng thái</p>
              <p className="font-semibold text-text-primary mt-1">{getContractStatusLabel(contractStatus)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Đơn giá nhuận bút</p>
              <p className="font-semibold text-text-primary mt-1">{formatVnd(baseGenkouryoPrice ?? 0)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Ngày ký</p>
              <p className="font-semibold text-text-primary mt-1">{formatDate(contractSignedDate)}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <Wallet size={18} className="text-success" />
              </div>
              <p className="text-sm text-text-secondary leading-snug">
                Sau khi xác nhận ký kết, vốn mới được nạp vào quỹ thiết lập để khóa trả lương trợ lý.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSignModal(true)}
              disabled={busy || contractStatus === 'Signed'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border-none bg-success text-white cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigning ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={16} />}
              {isSigning ? 'Đang ký...' : 'Xác nhận ký kết'}
            </button>
          </div>
        </div>
      )}

      {showDeclineModal && (
        <AnimatedModal
          open
          onClose={() => setShowDeclineModal(false)}
          panelClassName="relative w-full max-w-md bg-bg-secondary border border-border-custom rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center">
                <AlertTriangle size={17} className="text-danger" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Xác nhận từ chối vốn</h3>
                <p className="text-xs text-text-muted mt-0.5">Bộ truyện sẽ quay về bản nháp</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDeclineModal(false)}
              className="w-8 h-8 rounded-lg bg-bg-surface hover:bg-danger/10 text-text-muted hover:text-danger flex items-center justify-center transition-colors border-none cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              Nếu từ chối mức vốn {formatVnd(approvedBudget)}, hồ sơ sẽ trở về bản nháp để chỉnh sửa và gửi xét duyệt lại từ đầu.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-custom">
            <button
              type="button"
              onClick={() => setShowDeclineModal(false)}
              className="px-4 py-2.5 rounded-xl border border-border-custom bg-transparent text-sm text-text-secondary hover:bg-bg-surface cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmDecline}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-danger text-white text-sm font-medium border-none cursor-pointer hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {isDeclining ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              Từ chối vốn
            </button>
          </div>
        </AnimatedModal>
      )}

      {showSignModal && (
        <AnimatedModal
          open
          onClose={() => setShowSignModal(false)}
          panelClassName="relative w-full max-w-md bg-bg-secondary border border-border-custom rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                <FileSignature size={17} className="text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Xác nhận ký kết hợp đồng</h3>
                <p className="text-xs text-text-muted mt-0.5">Vốn sẽ được giải ngân sau khi ký</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSignModal(false)}
              className="w-8 h-8 rounded-lg bg-bg-surface hover:bg-danger/10 text-text-muted hover:text-danger flex items-center justify-center transition-colors border-none cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-5">
            <p className="text-sm text-text-secondary leading-relaxed">
              Vui lòng xác nhận bạn đã kiểm tra đầy đủ thông tin hợp đồng. Sau bước này, {formatVnd(approvedBudget)} sẽ được nạp vào quỹ thiết lập.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-custom">
            <button
              type="button"
              onClick={() => setShowSignModal(false)}
              className="px-4 py-2.5 rounded-xl border border-border-custom bg-transparent text-sm text-text-secondary hover:bg-bg-surface cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmSign}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-success text-white text-sm font-medium border-none cursor-pointer hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {isSigning ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={16} />}
              Xác nhận ký
            </button>
          </div>
        </AnimatedModal>
      )}
    </div>
  );
};
