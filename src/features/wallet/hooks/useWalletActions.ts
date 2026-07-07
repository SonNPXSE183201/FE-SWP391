import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { walletApi } from '../api/wallet.api';
import { getAxiosErrorMessage } from '../../../api/apiResponse';
import { useAuthStore } from '../../../stores/authStore';

const BANK_INFO_STORAGE_KEY = 'inkubus_last_bank_info';

export const useWalletActions = (
  mode: 'deposit' | 'withdraw',
  maxWithdrawAmount: number | undefined,
  onClose: () => void,
  onSuccess?: () => void
) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const savedBankInfo = JSON.parse(localStorage.getItem(BANK_INFO_STORAGE_KEY) || '{}');

  const [bankName, setBankName] = useState(savedBankInfo.bankName || 'Vietcombank');
  const [bankAccountNumber, setBankAccountNumber] = useState(savedBankInfo.bankAccountNumber || '');
  const [bankAccountName, setBankAccountName] = useState(user?.fullName?.toUpperCase() || '');

  const queryClient = useQueryClient();

  const depositMutation = useMutation({
    mutationFn: (amountValue: number) => walletApi.deposit({ amount: amountValue }),
    onSuccess: (response) => {
      if (response.data.success && response.data.data) {
        // Cùng tab: chuyển thẳng sang VNPay, sau thanh toán BE redirect về /mangaka/wallet
        window.location.assign(response.data.data);
        return;
      }
      setError(response.data.message || 'Có lỗi xảy ra khi tạo giao dịch nạp tiền.');
    },
    onError: (err: unknown) => {
      setError(getAxiosErrorMessage(err, 'Đã có lỗi hệ thống xảy ra.'));
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (data: { amount: number; bankName: string; bankAccountNumber: string; bankAccountName: string }) => walletApi.withdraw(data),
    onSuccess: (response) => {
      if (response.data.success) {
        localStorage.setItem(BANK_INFO_STORAGE_KEY, JSON.stringify({ bankName, bankAccountNumber }));
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        toast.success('Đã gửi yêu cầu rút tiền. Vui lòng chờ Admin duyệt.');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi tạo yêu cầu rút tiền.');
      }
    },
    onError: (err: unknown) => {
      setError(getAxiosErrorMessage(err, 'Đã có lỗi hệ thống xảy ra.'));
    },
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
      return;
    }

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
  };

  const loading = depositMutation.isPending || withdrawMutation.isPending;

  const isBankAccountNameInvalid = bankAccountName.length > 0 && !/^[A-Z\s]+$/.test(bankAccountName);
  const isBankAccountNumberInvalid = bankAccountNumber.length > 0 && !/^\d{9,14}$/.test(bankAccountNumber);
  const isFormInvalid = mode === 'withdraw' && (isBankAccountNameInvalid || isBankAccountNumberInvalid || !bankAccountName || !bankAccountNumber || !amount);

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
    isBankAccountNameInvalid,
    isBankAccountNumberInvalid,
    isFormInvalid,
  };
};
