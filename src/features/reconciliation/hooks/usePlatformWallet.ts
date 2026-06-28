import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformWalletApi, type TopUpPlatformWalletDto } from '../api/platformWallet.api';

export const usePlatformWallet = () =>
  useQuery({
    queryKey: ['platform-wallet'],
    queryFn: () => platformWalletApi.getTreasury(),
    staleTime: 60_000,
  });

export const useTopUpPlatformWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TopUpPlatformWalletDto) => platformWalletApi.topUp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
    },
  });
};
