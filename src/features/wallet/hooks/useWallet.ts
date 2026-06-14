import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';
import type { Wallet, Transaction, TransactionType } from '../../../types/entities';
import { useAuthStore } from '../../../stores/authStore';

export const useWallet = () => {
  const user = useAuthStore(state => state.user);

  return useQuery<{ wallet: Wallet; transactions: Transaction[] }, Error>({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      const response = await walletApi.getMyWallet();
      
      // Backend returns ApiResponse where IsSuccess and Data are PascalCase
      const apiResponse = response.data as any;
      if (!apiResponse.IsSuccess || !apiResponse.Data) {
        throw new Error(apiResponse.Message || 'Failed to fetch wallet data');
      }

      const backendData = apiResponse.Data;
      const bWallet = backendData.Wallet;
      
      const wallet: Wallet = {
        id: String(bWallet.Id),
        userId: String(bWallet.UserId),
        setupFundBalance: Number(bWallet.SetupFundBalance || 0),
        withdrawableBalance: Number(bWallet.WithdrawableBalance || 0),
        lockedAmount: Number(bWallet.LockedFund || 0) + Number(bWallet.LockedWithdrawable || 0),
        totalBalance: Number(bWallet.SetupFundBalance || 0) + Number(bWallet.WithdrawableBalance || 0),
        createdAt: bWallet.CreateAt,
        updatedAt: bWallet.UpdateAt,
      } as Wallet;

      const transactions: Transaction[] = (backendData.Transactions || []).map((tx: any) => ({
        id: String(tx.Id),
        walletId: String(tx.WalletId),
        type: tx.Type as TransactionType,
        amount: Number(tx.Amount || 0),
        setupFundAmount: Number(tx.SetupFundAmount || 0),
        withdrawableAmount: Number(tx.WithdrawableAmount || 0),
        referenceId: tx.ReferenceId ? String(tx.ReferenceId) : undefined,
        referenceCode: tx.ReferenceCode || '',
        description: tx.Description || `Giao dịch ${tx.Type} (${tx.Status})`,
        createdAt: tx.CreateAt,
        updatedAt: tx.UpdateAt,
      }));

      return { wallet, transactions };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
