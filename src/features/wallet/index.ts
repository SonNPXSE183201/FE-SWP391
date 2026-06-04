// Wallet feature — barrel export

// API
export { walletApi } from './api/wallet.api';
export type { DepositRequest, WithdrawRequest, DepositResponse } from './api/wallet.api';

// Constants
export { TX_TYPE_CONFIG, TX_FILTER_OPTIONS, formatVND } from './constants';

// Mock data (temporary — remove when backend API is ready)
export { MOCK_WALLET, MOCK_TRANSACTIONS } from './data/mockData';
export type { MockWallet, MockTransaction } from './data/mockData';
