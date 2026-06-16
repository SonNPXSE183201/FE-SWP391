import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { walletApi } from '../api/wallet.api';

interface DepositCallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

export const useDepositCallback = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<DepositCallbackState>({
    status: 'loading',
    message: 'Đang xử lý kết quả giao dịch...',
  });

  useEffect(() => {
    // If no params, wait or error
    if (!searchParams.toString()) {
      // It might be initial render, wait a bit or fail immediately
      return;
    }

    const confirmPayment = async () => {
      try {
        // Collect all query parameters to pass to backend
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        const response = await walletApi.confirmDeposit(queryParams);
        const apiData = response.data;
        
        // Backend returns standard ApiResponse
        if (apiData.IsSuccess && apiData.Data !== undefined) {
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
