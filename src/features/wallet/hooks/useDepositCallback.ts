import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { walletApi } from '../api/wallet.api';

interface DepositCallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

const LOADING_STATE: DepositCallbackState = {
  status: 'loading',
  message: 'Đang xử lý kết quả giao dịch...',
};

function getStateFromDepositStatus(searchParams: URLSearchParams): DepositCallbackState | null {
  const depositStatus = searchParams.get('depositStatus');
  if (!depositStatus) return null;

  const isSuccess = depositStatus === 'success';
  return {
    status: isSuccess ? 'success' : 'error',
    message:
      searchParams.get('message')
      || (isSuccess
        ? 'Nạp tiền thành công! Số dư của bạn đã được cập nhật.'
        : 'Giao dịch nạp tiền thất bại hoặc bị hủy.'),
  };
}

export const useDepositCallback = () => {
  const [searchParams] = useSearchParams();
  const queryState = useMemo(
    () => getStateFromDepositStatus(searchParams),
    [searchParams],
  );
  const [confirmedState, setConfirmedState] = useState<DepositCallbackState | null>(null);

  useEffect(() => {
    if (queryState || !searchParams.toString()) {
      return;
    }

    const confirmPayment = async () => {
      try {
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        const response = await walletApi.confirmDeposit(queryParams);
        const apiData = response.data;

        if (apiData.success) {
          setConfirmedState({
            status: 'success',
            message: apiData.message || 'Nạp tiền thành công! Số dư của bạn đã được cập nhật.',
          });
        } else {
          setConfirmedState({
            status: 'error',
            message: apiData.message || 'Giao dịch nạp tiền thất bại hoặc bị hủy.',
          });
        }
      } catch (error: unknown) {
        setConfirmedState({
          status: 'error',
          message: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra khi xác thực giao dịch.',
        });
      }
    };

    confirmPayment();
  }, [queryState, searchParams]);

  return queryState ?? confirmedState ?? LOADING_STATE;
};
