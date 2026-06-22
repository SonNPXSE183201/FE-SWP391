import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';
import type { Wallet, Transaction, TransactionType } from '../../../types/entities';
import type { WalletDetailsDto, TransactionDto } from '../../../api/generated/types';
import { useAuthStore } from '../../../stores/authStore';

type WalletApiEnvelope = {
  IsSuccess?: boolean;
  success?: boolean;
  Message?: string;
  message?: string;
  Data?: WalletDetailsDto;
  data?: WalletDetailsDto;
};

type LegacyWalletRow = Record<string, string | number | undefined>;

export const useWallet = () => {
  const user = useAuthStore(state => state.user);

  return useQuery<{ wallet: Wallet; transactions: Transaction[] }, Error>({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      const response = await walletApi.getMyWallet();
      
      // Backend returns ApiResponse where IsSuccess and Data are PascalCase
      const apiResponse = response.data as WalletApiEnvelope;
      if (!apiResponse.IsSuccess && !apiResponse.success) {
        throw new Error(apiResponse.Message || apiResponse.message || 'Failed to fetch wallet data');
      }

      const backendData = (apiResponse.data || apiResponse.Data) as WalletDetailsDto & {
        Wallet?: LegacyWalletRow;
        Transactions?: TransactionDto[];
      };
      const bWallet = (backendData.wallet || backendData.Wallet || {}) as LegacyWalletRow;
      
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

      const transactions: Transaction[] = (backendData.transactions || backendData.Transactions || []).map((tx: TransactionDto) => {
        const legacy = tx as TransactionDto & Record<string, string | number | null | undefined>;
        const txType = tx.type || (legacy.Type as string | undefined);
        const txStatus = tx.status || (legacy.Status as string | undefined);
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
          id: String(tx.id || legacy.Id),
          walletId: String(tx.walletId || legacy.WalletId),
          type: txType as TransactionType,
          amount: Number(tx.amount || legacy.Amount || 0),
          setupFundAmount: Number(tx.setupFundAmount || legacy.SetupFundAmount || 0),
          withdrawableAmount: Number(tx.withdrawableAmount || legacy.WithdrawableAmount || 0),
          referenceId: (tx.referenceId || legacy.ReferenceId) ? String(tx.referenceId || legacy.ReferenceId) : undefined,
          referenceCode: String(tx.referenceCode || legacy.ReferenceCode || ''),
          description: String(legacy.Description || `Giao dịch ${typeVi} (${statusVi})`),
          createdAt: String(tx.createAt || legacy.CreateAt || ''),
          updatedAt: String(tx.updateAt || legacy.UpdateAt || ''),
        };
      });

      return { wallet, transactions };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
