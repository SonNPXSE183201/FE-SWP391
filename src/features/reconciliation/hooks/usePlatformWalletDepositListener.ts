import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showAppError, showAppSuccess } from '../../../utils/appToast';
import { formatVND } from '../../wallet';

const topUpReturnToastKey = (referenceCode: string | null, amount: string | null) =>
  `platform-topup-toast:${referenceCode ?? 'unknown'}:${amount ?? '0'}`;

/** Xử lý redirect VNPay sau khi Admin nạp quỹ ví NXB. */
export const usePlatformWalletDepositListener = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const handledRef = useRef(false);

  useEffect(() => {
    const depositStatus = searchParams.get('depositStatus');
    const topUpType = searchParams.get('topUpType');
    if (!depositStatus || topUpType !== 'platform') {
      handledRef.current = false;
      return;
    }

    if (handledRef.current) return;
    handledRef.current = true;

    const amount = searchParams.get('amount');
    const message = searchParams.get('message');
    const referenceCode = searchParams.get('referenceCode');
    const toastKey = topUpReturnToastKey(referenceCode, amount);

    if (depositStatus === 'success') {
      if (!sessionStorage.getItem(toastKey)) {
        sessionStorage.setItem(toastKey, '1');
        showAppSuccess(
          amount
            ? `Nạp quỹ NXB thành công! +${formatVND(Number(amount))}`
            : 'Nạp quỹ NXB thành công qua VNPay!',
        );
      }
      queryClient.invalidateQueries({ queryKey: ['platform-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } else {
      showAppError(message || 'Giao dịch nạp quỹ thất bại hoặc bị hủy.');
    }

    navigate('/admin/reconciliation', { replace: true });
  }, [searchParams, navigate, queryClient]);
};
