import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Wallet, Clock, Hash, Banknote } from 'lucide-react';
import { useDepositCallback } from '../hooks/useDepositCallback';
import { useAuthStore } from '../../../stores/authStore';
import { formatVND } from '../constants';

export const DepositCallbackFeature = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { status, message } = useDepositCallback();

  // Role-aware navigation
  const walletPath = user?.role === 'Assistant' ? '/assistant/wallet' : '/mangaka/wallet';

  // Parse amount from URL for display
  const amount = new URLSearchParams(window.location.search).get('amount');
  const referenceCode = new URLSearchParams(window.location.search).get('referenceCode');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
      {/* Status Icon */}
      <div className="mb-6">
        {status === 'loading' && <Loader2 className="w-16 h-16 text-brand animate-spin" />}
        {status === 'success' && <CheckCircle className="w-16 h-16 text-success" />}
        {status === 'error' && <XCircle className="w-16 h-16 text-danger" />}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-text-primary mb-3">
        {status === 'loading' && 'Đang xác thực giao dịch...'}
        {status === 'success' && 'Nạp tiền thành công!'}
        {status === 'error' && 'Giao dịch không thành công'}
      </h2>

      {/* Message */}
      <p className="text-text-secondary mb-4 max-w-md">
        {message}
      </p>

      {/* Amount Display */}
      {status === 'success' && amount && (
        <div className="text-3xl font-bold font-mono text-success mb-6">
          +{formatVND(Number(amount))}
        </div>
      )}

      {/* Transaction Details Card */}
      {status !== 'loading' && (
        <div className="w-full max-w-sm bg-bg-secondary border border-border-custom rounded-xl p-4 mb-6 text-left space-y-3">
          {referenceCode && (
            <div className="flex items-center justify-between py-1.5">
              <span className="flex items-center gap-2 text-xs text-text-muted">
                <Hash size={14} /> Mã giao dịch
              </span>
              <span className="text-sm text-text-primary font-mono">{referenceCode}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5 border-t border-border-custom/50">
            <span className="flex items-center gap-2 text-xs text-text-muted">
              <Clock size={14} /> Thời gian
            </span>
            <span className="text-sm text-text-primary">
              {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-t border-border-custom/50">
            <span className="flex items-center gap-2 text-xs text-text-muted">
              <Banknote size={14} /> Nguồn quỹ
            </span>
            <span className="text-sm text-success font-medium">
              Quỹ khả dụng (WB)
            </span>
          </div>
        </div>
      )}

      {/* Back Button */}
      {status !== 'loading' && (
        <button
          onClick={() => navigate(walletPath)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white font-medium rounded-xl transition-colors shadow-brand cursor-pointer"
        >
          <Wallet size={16} /> Quay lại ví
        </button>
      )}
    </div>
  );
};
