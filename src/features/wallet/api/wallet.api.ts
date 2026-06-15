import { axiosInstance, type ApiResponse } from '../../../api/axios';
import { MOCK_WALLET, MOCK_TRANSACTIONS, type MockTransaction } from '../data/mockData';

// ─── Toggle this to false when backend wallet API is ready ───
const USE_MOCK = true;

// ─── Request DTOs ────────────────────────────────────────────
export interface DepositRequest {
  amount: number;
}

export interface WithdrawRequest {
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

// ─── Mock helper ─────────────────────────────────────────────
const mockDelay = (ms: number = 400) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Convert mock data to the PascalCase format that the backend returns.
 * useWallet.ts expects `response.data.IsSuccess`, `response.data.Data.Wallet`, etc.
 * When USE_MOCK, we mimic the full axios response shape: `{ data: { IsSuccess, Data, Message } }`
 */
const createMockAxiosResponse = <T>(data: T, message = 'Success') => ({
  data: {
    IsSuccess: true,
    Message: message,
    Data: data,
  },
});

const createMockErrorResponse = (message: string) => ({
  data: {
    IsSuccess: false,
    Message: message,
    Data: null,
  },
});

const toBackendTransaction = (tx: MockTransaction) => ({
  Id: tx.id,
  WalletId: MOCK_WALLET.id,
  Type: tx.type,
  ReferenceId: tx.referenceId || null,
  SetupFundAmount: tx.setupFundAmount,
  WithdrawableAmount: tx.withdrawableAmount,
  Amount: tx.amount,
  Status: 'Success',
  ReferenceCode: tx.referenceCode || null,
  Description: tx.description,
  FromUserFullName: null,
  ToUserFullName: null,
  CreateAt: tx.createdAt,
  UpdateAt: tx.createdAt,
});

// ─── Wallet API ──────────────────────────────────────────────
export const walletApi = {
  /**
   * GET /api/wallets/me
   * Returns wallet details with transactions.
   * useWallet.ts expects: response.data.Data.Wallet + response.data.Data.Transactions
   */
  getMyWallet: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      return createMockAxiosResponse({
        Wallet: {
          Id: MOCK_WALLET.id,
          UserId: 'user-1',
          SetupFundBalance: MOCK_WALLET.setupFundBalance,
          WithdrawableBalance: MOCK_WALLET.withdrawableBalance,
          LockedFund: MOCK_WALLET.lockedAmount * 0.7,   // ~70% from SF
          LockedWithdrawable: MOCK_WALLET.lockedAmount * 0.3, // ~30% from WB
          CreateAt: '2026-01-01T00:00:00Z',
          UpdateAt: new Date().toISOString(),
        },
        Transactions: MOCK_TRANSACTIONS.map(toBackendTransaction),
      });
    }
    return axiosInstance.get<ApiResponse<any>>('/api/wallets/me');
  },

  /**
   * POST /api/wallets/deposit
   * Returns a VNPay redirect URL string.
   * useWalletActions.ts expects: response.data.IsSuccess && response.data.Data (URL string)
   */
  deposit: async (data: DepositRequest) => {
    if (USE_MOCK) {
      await mockDelay(800);
      const refCode = `DEP-${Date.now()}`;
      // Simulate VNPay redirect: in mock mode we redirect to the callback page directly
      const mockUrl = `/wallet/deposit/callback?referenceCode=${refCode}&status=Success&amount=${data.amount}`;
      return createMockAxiosResponse(mockUrl, 'Đã tạo giao dịch nạp tiền');
    }
    return axiosInstance.post<ApiResponse<string>>('/api/wallets/deposit', data);
  },

  /**
   * GET /api/wallets/deposit/callback
   * Confirms deposit after VNPay redirect.
   * useDepositCallback.ts expects: response.data.IsSuccess, response.data.Message
   */
  confirmDeposit: async (referenceCode: string, status: string) => {
    if (USE_MOCK) {
      await mockDelay(500);
      const isSuccess = status === 'Success';
      
      if (isSuccess) {
        // Read amount from URL for mock mutation
        const amountStr = new URLSearchParams(window.location.search).get('amount');
        if (amountStr) {
          const amount = Number(amountStr);
          // Prevent double processing if user refreshes the page
          const alreadyProcessed = MOCK_TRANSACTIONS.find(t => t.referenceCode === referenceCode);
          if (!alreadyProcessed) {
            MOCK_WALLET.withdrawableBalance += amount;
            MOCK_WALLET.totalBalance += amount;
            MOCK_TRANSACTIONS.unshift({
              id: `tx-${Date.now()}`,
              type: 'Deposit',
              amount: amount,
              setupFundAmount: 0,
              withdrawableAmount: amount,
              referenceId: `vnp-${Date.now()}`,
              referenceCode: referenceCode,
              description: 'Nạp tiền qua VNPay',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      return createMockAxiosResponse(
        isSuccess,
        isSuccess ? 'Nạp tiền thành công!' : 'Giao dịch thất bại hoặc bị hủy.'
      );
    }
    return axiosInstance.get<ApiResponse<boolean>>('/api/wallets/deposit/callback', {
      params: { referenceCode, status },
    });
  },

  /**
   * POST /api/wallets/withdraw
   * useWalletActions.ts expects: response.data.IsSuccess
   */
  withdraw: async (data: WithdrawRequest) => {
    if (USE_MOCK) {
      await mockDelay(800);
      if (data.amount > MOCK_WALLET.withdrawableBalance) {
        return createMockErrorResponse(
          `Số dư không đủ. Số dư khả dụng: ${MOCK_WALLET.withdrawableBalance.toLocaleString('vi-VN')}₫`
        );
      }

      // Mutate mock wallet
      MOCK_WALLET.withdrawableBalance -= data.amount;
      MOCK_WALLET.totalBalance -= data.amount;
      const refCode = `WD-${Date.now()}`;
      
      MOCK_TRANSACTIONS.unshift({
        id: `tx-${Date.now()}`,
        type: 'Withdraw',
        amount: -data.amount,
        setupFundAmount: 0,
        withdrawableAmount: -data.amount,
        referenceId: `wd-${Date.now()}`,
        referenceCode: refCode,
        description: `Rút tiền về ${data.bankName} **** ${data.bankAccountNumber.slice(-4)}`,
        createdAt: new Date().toISOString(),
      });

      return createMockAxiosResponse(
        { amount: data.amount, referenceCode: refCode },
        'Yêu cầu rút tiền đã được gửi thành công.'
      );
    }
    return axiosInstance.post<ApiResponse<any>>('/api/wallets/withdraw', data);
  },
};
