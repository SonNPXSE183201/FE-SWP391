import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../stores/authStore';
import { formatVND } from '../constants/wallet.constants';

const depositReturnToastKey = (referenceCode: string | null, amount: string | null) =>
  `wallet-deposit-toast:${referenceCode ?? 'unknown'}:${amount ?? '0'}`;

export const useWalletDepositListener = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userRole = useAuthStore((state) => state.user?.role);
  const handledRef = useRef(false);

  useEffect(() => {
    const depositStatus = searchParams.get('depositStatus');
    if (!depositStatus) {
      handledRef.current = false;
      return;
    }

    if (handledRef.current) return;
    handledRef.current = true;

    const amount = searchParams.get('amount');
    const message = searchParams.get('message');
    const referenceCode = searchParams.get('referenceCode');
    const walletPath = userRole === 'Assistant' ? '/assistant/wallet' : '/mangaka/wallet';
    const toastKey = depositReturnToastKey(referenceCode, amount);

    if (depositStatus === 'success') {
      if (!sessionStorage.getItem(toastKey)) {
        sessionStorage.setItem(toastKey, '1');
        toast.success(
          amount
            ? `Nạp tiền thành công! +${formatVND(Number(amount))}`
            : 'Nạp tiền thành công!',
        );
      }
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } else {
      toast.error(message || 'Giao dịch nạp tiền thất bại hoặc bị hủy.');
    }

    navigate(walletPath, { replace: true });
  }, [searchParams, navigate, queryClient, userRole]);
};