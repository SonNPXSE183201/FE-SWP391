import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { walletApi } from '../api/wallet.api';

export const useDepositCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xử lý kết quả giao dịch...');

  useEffect(() => {
    const referenceCode = searchParams.get('referenceCode');
    const paymentStatus = searchParams.get('status');

    if (!referenceCode || !paymentStatus) {
      setStatus('error');
      setMessage('Không tìm thấy thông tin giao dịch.');
      return;
    }

    const confirmPayment = async () => {
      try {
        const response = await walletApi.confirmDeposit(referenceCode, paymentStatus);
        if (response.data.IsSuccess && response.data.Data) {
          setStatus('success');
          setMessage(response.data.Message || 'Nạp tiền thành công! Số dư của bạn đã được cập nhật.');
        } else {
          setStatus('error');
          setMessage(response.data.Message || 'Giao dịch nạp tiền thất bại hoặc bị hủy.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error?.response?.data?.Message || 'Có lỗi xảy ra khi xác thực giao dịch.');
      }
    };

    confirmPayment();
  }, [searchParams]);

  return {
    status,
    message,
  };
};
