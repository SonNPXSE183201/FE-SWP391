import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Wallet, Clock, Hash, Banknote } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useDepositCallback } from '../hooks/useDepositCallback';
import { useAuthStore } from '../../../stores/authStore';
import { formatVND } from '../constants';
import { MotionItem, MotionStagger } from '../../../components/common/animation';

/** Trang fallback khi FrontendReturnUrl trỏ về /wallet/deposit/callback */
export const DepositCallbackFeature = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const { status, message } = useDepositCallback();

  const walletPath = user?.role === 'Assistant' ? '/assistant/wallet' : '/mangaka/wallet';

  const search = new URLSearchParams(window.location.search);
  const amountStr = search.get('amount') || search.get('vnp_Amount');
  const amount = amountStr ? (search.has('vnp_Amount') ? Number(amountStr) / 100 : Number(amountStr)) : null;
  const referenceCode = search.get('referenceCode') || search.get('vnp_TxnRef');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'success') {
      toast.success(
        amount
          ? `Nạp tiền thành công! +${formatVND(Number(amount))}`
          : 'Nạp tiền thành công!',
      );
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } else {
      toast.error(message || 'Giao dịch nạp tiền thất bại hoặc bị hủy.');
    }

    const timer = window.setTimeout(() => {
      navigate(walletPath, { replace: true });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [status, amount, message, navigate, walletPath, queryClient]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
        >
          {status === 'loading' && <Loader2 className="w-16 h-16 text-brand animate-spin" />}
          {status === 'success' && <CheckCircle className="w-16 h-16 text-success" />}
          {status === 'error' && <XCircle className="w-16 h-16 text-danger" />}
        </motion.div>
      </AnimatePresence>

      <h2 className="text-2xl font-bold text-text-primary mb-3">
        {status === 'loading' && 'Đang xác thực giao dịch...'}
        {status === 'success' && 'Nạp tiền thành công!'}
        {status === 'error' && 'Giao dịch không thành công'}
      </h2>

      <p className="text-text-secondary mb-4 max-w-md">
        {status === 'loading' ? message : 'Đang chuyển về trang ví...'}
      </p>

      {status === 'success' && amount && (
        <motion.div
          className="text-3xl font-bold font-mono text-success mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          +{formatVND(Number(amount))}
        </motion.div>
      )}

      {status !== 'loading' && (
        <MotionStagger className="w-full max-w-sm bg-bg-secondary border border-border-custom rounded-xl p-4 mb-6 text-left space-y-3">
          {referenceCode && (
            <MotionItem>
              <div className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-2 text-xs text-text-muted">
                  <Hash size={14} /> Mã giao dịch
                </span>
                <span className="text-sm text-text-primary font-mono">{referenceCode}</span>
              </div>
            </MotionItem>
          )}
          <MotionItem>
            <div className="flex items-center justify-between py-1.5 border-t border-border-custom/50">
              <span className="flex items-center gap-2 text-xs text-text-muted">
                <Clock size={14} /> Thời gian
              </span>
              <span className="text-sm text-text-primary">
                {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </MotionItem>
          <MotionItem>
            <div className="flex items-center justify-between py-1.5 border-t border-border-custom/50">
              <span className="flex items-center gap-2 text-xs text-text-muted">
                <Banknote size={14} /> Nguồn quỹ
              </span>
              <span className="text-sm text-success font-medium">
                Quỹ khả dụng (WB)
              </span>
            </div>
          </MotionItem>
        </MotionStagger>
      )}

      {status !== 'loading' && (
        <motion.button
          onClick={() => navigate(walletPath, { replace: true })}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white font-medium rounded-xl transition-colors shadow-brand cursor-pointer border-none"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Wallet size={16} /> Quay lại ví ngay
        </motion.button>
      )}
    </motion.div>
  );
};
