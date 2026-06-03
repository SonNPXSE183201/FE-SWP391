import { ShieldCheck, Info, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface RegisterConfirmModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const RegisterConfirmModal = ({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: RegisterConfirmModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current && !isLoading) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-bg-secondary border border-border-custom rounded-2xl shadow-2xl animate-fade-in ring-1 ring-white/5">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-bg-surface/50 border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Xác nhận đăng ký</h3>
              <p className="text-text-muted text-xs">Vui lòng đọc kỹ trước khi gửi</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-custom" />

        {/* Info cards */}
        <div className="px-6 py-5 space-y-3">
          {/* Approval notice */}
          <div className="bg-warning/5 border border-warning/15 rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-[18px] h-[18px] text-warning" />
            </div>
            <div>
              <p className="text-warning text-sm font-semibold mb-1">Cần phê duyệt</p>
              <p className="text-text-secondary text-[13px] leading-relaxed">
                Sau khi đăng ký, tài khoản cần được{' '}
                <strong className="text-text-primary">Admin phê duyệt</strong> trước khi bạn có thể nhận task từ Mangaka.
              </p>
            </div>
          </div>

          {/* Work model notice */}
          <div className="bg-brand/5 border border-brand/15 rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-[18px] h-[18px] text-brand" />
            </div>
            <div>
              <p className="text-brand text-sm font-semibold mb-1">Mô hình làm việc</p>
              <p className="text-text-secondary text-[13px] leading-relaxed">
                Bạn sẽ làm việc trực tiếp với từng Mangaka — nhận task, nộp bài, nhận thanh toán. Không có nhóm hay đội ngũ cố định.
              </p>
            </div>
          </div>

          {/* Terms */}
          <p className="text-text-muted text-[11px] leading-relaxed pt-1">
            Bằng việc xác nhận, bạn đồng ý với{' '}
            <a href="#" className="text-text-secondary hover:text-text-primary underline transition-colors">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="#" className="text-text-secondary hover:text-text-primary underline transition-colors">
              Chính sách bảo mật
            </a>{' '}
            của chúng tôi.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-custom" />

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-border-custom text-text-secondary hover:bg-bg-surface/50 hover:border-text-muted font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-brand hover:shadow-brand-hover active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận đăng ký
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
