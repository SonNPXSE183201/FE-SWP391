import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';
import type { ApiResponse, WalletDetailsDto, WalletDto, TransactionDto } from '../../../api/generated/types';
import { isApiSuccess, getApiMessage } from '../../../api/apiResponse';
import { useAuthStore } from '../../../stores/authStore';

export const useWallet = () => {
  const user = useAuthStore(state => state.user);

  return useQuery<{ wallet: WalletDto; transactions: TransactionDto[] }, Error>({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      const response = await walletApi.getMyWallet();

      const apiResponse = response.data as ApiResponse<WalletDetailsDto>;
      if (!isApiSuccess(apiResponse)) {
        throw new Error(getApiMessage(apiResponse, 'Failed to fetch wallet data'));
      }

      const backendData = apiResponse.data;
      const wallet: WalletDto = backendData.wallet ?? {};
      const transactions: TransactionDto[] = backendData.transactions ?? [];

      return { wallet, transactions };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
