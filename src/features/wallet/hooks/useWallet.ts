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

      const backendData = apiResponse.data || apiResponse.Data;
      const bWallet = backendData.wallet || backendData.Wallet;
      
      const wallet: Wallet = {
        id: String(bWallet.id || bWallet.Id),
        userId: String(bWallet.userId || bWallet.UserId),
        setupFundBalance: Number(bWallet.setupFundBalance || bWallet.SetupFundBalance || 0),
        withdrawableBalance: Number(bWallet.withdrawableBalance || bWallet.WithdrawableBalance || 0),
        lockedAmount: Number(bWallet.lockedFund || bWallet.LockedFund || 0) + Number(bWallet.lockedWithdrawable || bWallet.LockedWithdrawable || 0),
        totalBalance: Number(bWallet.setupFundBalance || bWallet.SetupFundBalance || 0) + Number(bWallet.withdrawableBalance || bWallet.WithdrawableBalance || 0),
        createdAt: bWallet.createAt || bWallet.CreateAt,
        updatedAt: bWallet.updateAt || bWallet.UpdateAt,
      } as Wallet;

      const transactions: Transaction[] = (backendData.transactions || backendData.Transactions || []).map((tx: any) => {
        const txType = tx.type || tx.Type;
        const txStatus = tx.status || tx.Status;
        const typeVi = {
          'Deposit': 'Nạp tiền',
          'Withdraw': 'Rút tiền',
          'Lock': 'Khóa tiền',
          'Unlock': 'Mở khóa',
          'Escrow_Lock': 'Tạm giữ tiền',
          'Escrow_Unlock': 'Hoàn trả quỹ',
          'Transfer': 'Thanh toán',
          'Funding': 'Cấp vốn',
          'Genkouryo': 'Nhuận bút',
        }[txType as string] || txType;

        const statusVi = txStatus === 'Success' ? 'Thành công' : txStatus === 'Pending' ? 'Đang xử lý' : txStatus === 'Failed' ? 'Thất bại' : txStatus;

        return {
          id: String(tx.id || tx.Id),
          walletId: String(tx.walletId || tx.WalletId),
          type: txType as TransactionType,
          amount: Number(tx.amount || tx.Amount || 0),
          setupFundAmount: Number(tx.setupFundAmount || tx.SetupFundAmount || 0),
          withdrawableAmount: Number(tx.withdrawableAmount || tx.WithdrawableAmount || 0),
          referenceId: (tx.referenceId || tx.ReferenceId) ? String(tx.referenceId || tx.ReferenceId) : undefined,
          referenceCode: tx.referenceCode || tx.ReferenceCode || '',
          description: tx.description || tx.Description || `Giao dịch ${typeVi} (${statusVi})`,
          createdAt: tx.createAt || tx.CreateAt,
          updatedAt: tx.updateAt || tx.UpdateAt,
        };
      });

      return { wallet, transactions };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
