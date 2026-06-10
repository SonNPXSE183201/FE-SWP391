import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useDepositCallback } from '../hooks/useDepositCallback';

export const DepositCallbackFeature = () => {
  const navigate = useNavigate();
  const { status, message } = useDepositCallback();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
      <div className="mb-6">
        {status === 'loading' && <Loader2 className="w-16 h-16 text-brand animate-spin" />}
        {status === 'success' && <CheckCircle className="w-16 h-16 text-success" />}
        {status === 'error' && <XCircle className="w-16 h-16 text-danger" />}
      </div>
      
      <h2 className="text-2xl font-bold text-text-primary mb-3">
        {status === 'loading' && 'Đang xác thực giao dịch...'}
        {status === 'success' && 'Nạp tiền thành công!'}
        {status === 'error' && 'Giao dịch không thành công'}
      </h2>
      
      <p className="text-text-secondary mb-8 max-w-md">
        {message}
      </p>

      {status !== 'loading' && (
        <button
          onClick={() => navigate('/mangaka/wallet')}
          className="px-6 py-3 bg-brand hover:bg-brand-hover text-white font-medium rounded-xl transition-colors shadow-brand"
        >
          Quay lại ví
        </button>
      )}
    </div>
  );
};
