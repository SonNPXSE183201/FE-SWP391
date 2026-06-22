import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';
import { getAxiosErrorMessage } from '../../../api/apiResponse';

export const useWalletActions = (
  mode: 'deposit' | 'withdraw',
  maxWithdrawAmount: number | undefined,
  onClose: () => void,
  onSuccess?: () => void
) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  // States cho Withdraw
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  const queryClient = useQueryClient();

  const depositMutation = useMutation({
    mutationFn: (amountValue: number) => walletApi.deposit({ amount: amountValue }),
    onSuccess: (response) => {
      if (response.data.success && response.data.data) {
        // Redirect to VNPay or mock url in a new tab
        window.open(response.data.data, '_blank');
        onClose();
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi tạo giao dịch nạp tiền.');
      }
    },
    onError: (err: unknown) => {
      setError(getAxiosErrorMessage(err, 'Đã có lỗi hệ thống xảy ra.'));
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: (data: { amount: number; bankName: string; bankAccountNumber: string; bankAccountName: string }) => walletApi.withdraw(data),
    onSuccess: (response) => {
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi tạo yêu cầu rút tiền.');
      }
    },
    onError: (err: unknown) => {
      setError(getAxiosErrorMessage(err, 'Đã có lỗi hệ thống xảy ra.'));
    }
  });

  const presetAmounts =
    mode === 'deposit'
      ? [500000, 1000000, 2000000, 5000000]
      : [500000, 1000000, 2000000];

  const handleSubmit = () => {
    const amountValue = Number(amount);
    if (!amount || amountValue <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (mode === 'withdraw' && maxWithdrawAmount !== undefined && amountValue > maxWithdrawAmount) {
      setError(`Số tiền rút không được vượt quá số dư khả dụng (${maxWithdrawAmount.toLocaleString('vi-VN')} VND).`);
      return;
    }

    setError(null);

    if (mode === 'deposit') {
      depositMutation.mutate(amountValue);
    } else {
      if (!bankAccountNumber || !bankAccountName) {
        setError('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng.');
        return;
      }
      withdrawMutation.mutate({
        amount: amountValue,
        bankName,
        bankAccountNumber,
        bankAccountName,
      });
    }
  };

  const loading = depositMutation.isPending || withdrawMutation.isPending;

  return {
    amount,
    setAmount,
    loading,
    error,
    bankName,
    setBankName,
    bankAccountNumber,
    setBankAccountNumber,
    bankAccountName,
    setBankAccountName,
    presetAmounts,
    handleSubmit,
  };
};
