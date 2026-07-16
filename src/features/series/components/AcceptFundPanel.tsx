import { useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  Eye,
  FileSignature,
  Loader2,
  ScrollText,
  Wallet,
  X,
} from 'lucide-react';
import { AnimatedModal } from '../../../components/common/animation';
import { HelpTip } from '../../../components/common/HelpTip';
import { formatVND } from '../../../utils/currency';

const formatDate = (value?: string | null) => {
  if (!value) return 'Chưa ký';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa ký';
  return date.toLocaleDateString('vi-VN');
};

const getContractStatusLabel = (status?: string | null) => {
  const normalized = (status ?? '').trim().toLowerCase();
  if (normalized === 'signed') return 'Đã ký';
  if (normalized === 'active') return 'Đang hiệu lực';
  return 'Chờ tác giả ký';
};

const isContractSigned = (status?: string | null) =>
  ['signed', 'active'].includes((status ?? '').trim().toLowerCase());

interface AcceptFundPanelProps {
  estimatedBudget: number;
  approvedBudget: number;
  hasContract: boolean;
  contractId?: number | null;
  contractStatus?: string | null;
  baseGenkouryoPrice?: number | null;
  contractSignedDate?: string | null;
  contractFileUrl?: string | null;
  isSigning: boolean;
  onSign: () => void;
}

export const AcceptFundPanel = ({
  estimatedBudget,
  approvedBudget,
  hasContract,
  contractId,
  contractStatus,
  baseGenkouryoPrice,
  contractSignedDate,
  contractFileUrl,
  isSigning,
  onSign,
}: AcceptFundPanelProps) => {
  const diff = approvedBudget - estimatedBudget;
  const [showSignModal, setShowSignModal] = useState(false);

  const handleConfirmSign = () => {
    setShowSignModal(false);
    onSign();
  };

  return (
    <div className="bg-bg-secondary border border-success/20 rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Banknote size={16} className="text-success" />
        <h2 className="text-sm font-semibold text-text-primary">Gói vốn đã được Hội đồng duyệt</h2>
        <HelpTip
          size="sm"
          content="Bạn không cần xác nhận vốn nữa. Sau khi Hội đồng duyệt, hồ sơ tự động chuyển sang Admin để lập hợp đồng."
        />
      </div>

      <p className="text-xs text-text-muted leading-relaxed">
        Hội đồng đã chốt số vốn thực tế NXB dự kiến cấp. Admin sẽ lập hợp đồng dựa trên mức vốn này; bạn chỉ cần xem và ký hợp đồng khi có thông báo.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border-custom bg-bg-primary p-4">
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Bạn đề xuất</p>
          <p className="text-lg font-bold text-text-primary mt-1">{formatVND(estimatedBudget)}</p>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <p className="text-[10px] uppercase tracking-wider text-success font-medium">Hội đồng duyệt</p>
          <p className="text-lg font-bold text-success mt-1">{formatVND(approvedBudget)}</p>
          {diff !== 0 && (
            <p className={`text-[11px] mt-1 ${diff > 0 ? 'text-success' : 'text-amber-400'}`}>
              {diff > 0 ? `Cao hơn ${formatVND(diff)}` : `Thấp hơn ${formatVND(Math.abs(diff))}`}
            </p>
          )}
        </div>
      </div>

      {!hasContract ? (
        <div className="mt-4 rounded-xl border border-info/20 bg-info/5 p-4 flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-info" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">Đang chờ Admin lập hợp đồng</p>
            <p className="text-sm text-text-secondary leading-snug mt-1">
              Hồ sơ đã được chuyển sang danh sách chờ lập hợp đồng của Admin. Khi hợp đồng được tạo, màn hình này sẽ tự cập nhật realtime để bạn xem và ký.
            </p>
          </div>
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
              <p className="font-semibold text-text-primary mt-1">{formatVND(baseGenkouryoPrice ?? 0)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Ngày ký</p>
              <p className="font-semibold text-text-primary mt-1">{formatDate(contractSignedDate)}</p>
            </div>
          </div>
          {contractFileUrl && (
            <div className="mt-4 rounded-xl border border-info/20 bg-info/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                  <ScrollText size={18} className="text-info" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">Bản hợp đồng PDF</p>
                  <p className="text-xs text-text-muted mt-0.5">Xem đầy đủ nội dung hợp đồng trước khi ký.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.open(contractFileUrl, '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-info text-white text-sm font-medium border-none cursor-pointer hover:opacity-90 transition-colors"
              >
                <Eye size={14} />
                Xem hợp đồng
              </button>
            </div>
          )}
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
              disabled={isSigning || isContractSigned(contractStatus)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border-none bg-success text-white cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigning ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={16} />}
              {isSigning ? 'Đang ký...' : 'Xác nhận ký kết'}
            </button>
          </div>
        </div>
      )}

      {showSignModal && (
        <AnimatedModal
          open
          onClose={() => setShowSignModal(false)}
          panelClassName="relative w-full max-w-lg bg-bg-secondary border border-border-custom rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
                <FileSignature size={19} className="text-success" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Xác nhận ký hợp đồng</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Hoàn tất ký điện tử để kích hoạt ngân sách sản xuất
                </p>
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
          <div className="p-5 space-y-4">
            <div className="rounded-xl border border-success/25 bg-success/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <Wallet size={18} className="text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-success font-semibold">
                    Ngân sách được kích hoạt
                  </p>
                  <p className="text-xl font-bold text-text-primary mt-1">{formatVND(approvedBudget)}</p>
                  <p className="text-xs text-text-muted leading-relaxed mt-1.5">
                    Số tiền này được nạp vào quỹ thiết lập của bộ truyện sau khi hợp đồng được ký thành công.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                <p>Bạn đã mở và kiểm tra nội dung bản hợp đồng PDF.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                <p>Hệ thống sẽ ghi nhận chữ ký điện tử của bạn trên hợp đồng này.</p>
              </div>
            </div>

            <p className="rounded-xl border border-warning/20 bg-warning/5 px-4 py-3 text-xs leading-relaxed text-text-secondary">
              Sau khi xác nhận, thao tác ký không thể hủy trực tiếp trên màn hình này. Nếu phát hiện sai thông tin, hãy quay lại kiểm tra hợp đồng trước khi ký.
            </p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 px-5 py-4 border-t border-border-custom bg-bg-primary/30">
            <button
              type="button"
              onClick={() => setShowSignModal(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border-custom bg-transparent text-sm text-text-secondary hover:bg-bg-surface cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmSign}
              disabled={isSigning}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-success text-white text-sm font-semibold border-none cursor-pointer hover:opacity-90 transition-colors disabled:opacity-50 shadow-sm shadow-success/20"
            >
              {isSigning ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={16} />}
              {isSigning ? 'Đang ký...' : 'Xác nhận ký hợp đồng'}
            </button>
          </div>
        </AnimatedModal>
      )}
    </div>
  );
};
