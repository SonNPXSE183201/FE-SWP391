import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { walletApi } from '../api/wallet.api';

interface DepositCallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

/**
 * Hook to handle VNPay deposit callback.
 * Reads referenceCode and status from URL search params.
 * Supports both simplified params (?referenceCode=...&status=...) 
 * and raw VNPay params (?vnp_TxnRef=...&vnp_ResponseCode=...).
 */
export const useDepositCallback = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<DepositCallbackState>({
    status: 'loading',
    message: 'Đang xử lý kết quả giao dịch...',
  });

  useEffect(() => {
    // Support both simplified and raw VNPay params
    const referenceCode = searchParams.get('referenceCode') || searchParams.get('vnp_TxnRef');
    let paymentStatus = searchParams.get('status');

    // Map VNPay response code to status
    if (!paymentStatus) {
      const vnpResponseCode = searchParams.get('vnp_ResponseCode');
      paymentStatus = vnpResponseCode === '00' ? 'Success' : 'Failed';
    }

    if (!referenceCode || !paymentStatus) {
      setState({
        status: 'error',
        message: 'Không tìm thấy thông tin giao dịch. Vui lòng liên hệ hỗ trợ.',
      });
      return;
    }

    const confirmPayment = async () => {
      try {
        const response = await walletApi.confirmDeposit(referenceCode, paymentStatus!);
        // Mock API returns { data: { IsSuccess, Data, Message } }
        const apiData = response.data;
        if (apiData.IsSuccess && apiData.Data) {
          setState({
            status: 'success',
            message: apiData.Message || 'Nạp tiền thành công! Số dư của bạn đã được cập nhật.',
          });
        } else {
          setState({
            status: 'error',
            message: apiData.Message || 'Giao dịch nạp tiền thất bại hoặc bị hủy.',
          });
        }
      } catch (error: any) {
        setState({
          status: 'error',
          message: error?.response?.data?.Message || 'Có lỗi xảy ra khi xác thực giao dịch.',
        });
      }
    };

    confirmPayment();
  }, [searchParams]);

  return state;
};
