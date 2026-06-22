import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';
import type { Wallet, Transaction, TransactionType } from '../../../types/entities';
import type { ApiResponse, WalletDetailsDto, TransactionDto } from '../../../api/generated/types';
import { isApiSuccess, getApiMessage } from '../../../api/apiResponse';
import { useAuthStore } from '../../../stores/authStore';
import { normalizeTransactionType } from '../utils';

export const useWallet = () => {
  const user = useAuthStore(state => state.user);

  return useQuery<{ wallet: Wallet; transactions: Transaction[] }, Error>({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      const response = await walletApi.getMyWallet();
      
      const apiResponse = response.data as ApiResponse<WalletDetailsDto>;
      if (!isApiSuccess(apiResponse)) {
        throw new Error(getApiMessage(apiResponse, 'Failed to fetch wallet data'));
      }

      const backendData = apiResponse.data;
      const bWallet = backendData.wallet ?? {};
      
      const wallet: Wallet = {
        id: String(bWallet.id ?? ''),
        userId: String(bWallet.userId ?? ''),
        setupFundBalance: Number(bWallet.setupFundBalance ?? 0),
        withdrawableBalance: Number(bWallet.withdrawableBalance ?? 0),
        lockedAmount: Number(bWallet.lockedFund ?? 0) + Number(bWallet.lockedWithdrawable ?? 0),
        totalBalance: Number(bWallet.setupFundBalance ?? 0) + Number(bWallet.withdrawableBalance ?? 0),
        createdAt: bWallet.createAt,
        updatedAt: bWallet.updateAt,
      } as Wallet;

      const transactions: Transaction[] = (backendData.transactions ?? []).map((tx: TransactionDto) => {
        const txType = normalizeTransactionType(tx.type ?? '');
        const txStatus = tx.status;
        const typeVi = {
          'Deposit': 'Nạp tiền',
          'Withdraw': 'Rút tiền',
          'Withdrawal': 'Rút tiền',
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
          id: String(tx.id ?? ''),
          walletId: String(tx.walletId ?? ''),
          type: txType as TransactionType,
          amount: Number(tx.amount ?? 0),
          setupFundAmount: Number(tx.setupFundAmount ?? 0),
          withdrawableAmount: Number(tx.withdrawableAmount ?? 0),
          referenceId: tx.referenceId ? String(tx.referenceId) : undefined,
          referenceCode: String(tx.referenceCode ?? ''),
          description: String(tx.referenceCode ? `Giao dịch ${typeVi} (${statusVi})` : `Giao dịch ${typeVi} (${statusVi})`),
          createdAt: String(tx.createAt ?? ''),
          updatedAt: String(tx.updateAt ?? ''),
        };
      });

      return { wallet, transactions };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
