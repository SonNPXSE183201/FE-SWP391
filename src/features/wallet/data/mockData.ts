import type { TransactionType } from '../../../types/entities';

// TODO: Replace with React Query hooks when backend API is ready

export interface MockWallet {
  id: string;
  setupFundBalance: number;
  withdrawableBalance: number;
  totalBalance: number;
  lockedAmount: number;
}

export interface MockTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  setupFundAmount: number;
  withdrawableAmount: number;
  referenceId: string;
  referenceCode: string;
  description: string;
  createdAt: string;
}

export const MOCK_WALLET: MockWallet = {
  id: 'w-1',
  setupFundBalance: 8500000,
  withdrawableBalance: 4000000,
  totalBalance: 12500000,
  lockedAmount: 1980000,
};

export const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'tx-1', type: 'Lock', amount: -350000,
    setupFundAmount: -350000, withdrawableAmount: 0,
    referenceId: 't-1', referenceCode: 'TASK-001',
    description: 'Lock tiền cho Task: Panel A1 — Trang 5, Ch.4',
    createdAt: '2026-06-03T14:00:00Z',
  },
  {
    id: 'tx-2', type: 'Transfer', amount: -300000,
    setupFundAmount: -300000, withdrawableAmount: 0,
    referenceId: 't-4', referenceCode: 'TASK-004',
    description: 'Thanh toán cho Minh Anh — Task: Panel A2',
    createdAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'tx-3', type: 'Genkouryo', amount: 1200000,
    setupFundAmount: 0, withdrawableAmount: 1200000,
    referenceId: 'ch-2', referenceCode: 'GKR-002',
    description: 'Nhuận bút Ch.2 "Cuộc gặp gỡ định mệnh" (22 trang × 54.545₫)',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'tx-4', type: 'Funding', amount: 5000000,
    setupFundAmount: 5000000, withdrawableAmount: 0,
    referenceId: 'fund-1', referenceCode: 'FUND-001',
    description: 'Board cấp vốn cho Series "Huyền Thoại Samurai"',
    createdAt: '2026-05-28T08:00:00Z',
  },
  {
    id: 'tx-5', type: 'Deposit', amount: 2000000,
    setupFundAmount: 0, withdrawableAmount: 2000000,
    referenceId: 'vnp-1', referenceCode: 'VNP-20260525-001',
    description: 'Nạp tiền qua VNPay',
    createdAt: '2026-05-25T16:00:00Z',
  },
  {
    id: 'tx-6', type: 'Withdraw', amount: -1500000,
    setupFundAmount: 0, withdrawableAmount: -1500000,
    referenceId: 'wd-1', referenceCode: 'WD-20260520-001',
    description: 'Rút tiền về Vietcombank **** 4821',
    createdAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'tx-7', type: 'Unlock', amount: 320000,
    setupFundAmount: 320000, withdrawableAmount: 0,
    referenceId: 't-7', referenceCode: 'TASK-007',
    description: 'Hoàn tiền Task bị hủy: Panel A3',
    createdAt: '2026-05-26T10:00:00Z',
  },
  {
    id: 'tx-8', type: 'Lock', amount: -500000,
    setupFundAmount: -400000, withdrawableAmount: -100000,
    referenceId: 't-2', referenceCode: 'TASK-002',
    description: 'Lock tiền cho Task: Background B2 (SF thiếu → WB bù)',
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'tx-9', type: 'Withdraw', amount: -2000000,
    setupFundAmount: 0, withdrawableAmount: -2000000,
    referenceId: 'wd-2', referenceCode: 'WD-20260515-001',
    description: 'Rút tiền về Vietcombank **** 4821',
    createdAt: '2026-05-15T09:00:00Z',
  },
  {
    id: 'tx-10', type: 'Genkouryo', amount: 1300000,
    setupFundAmount: 0, withdrawableAmount: 1300000,
    referenceId: 'ch-1', referenceCode: 'GKR-001',
    description: 'Nhuận bút Ch.1 "Khởi đầu" (24 trang)',
    createdAt: '2026-04-22T10:00:00Z',
  },
  {
    id: 'tx-11', type: 'Deposit', amount: 1000000,
    setupFundAmount: 0, withdrawableAmount: 1000000,
    referenceId: 'vnp-2', referenceCode: 'VNP-20260420-001',
    description: 'Nạp tiền qua VNPay',
    createdAt: '2026-04-20T14:00:00Z',
  },
  {
    id: 'tx-12', type: 'Transfer', amount: -250000,
    setupFundAmount: -250000, withdrawableAmount: 0,
    referenceId: 't-9', referenceCode: 'TASK-009',
    description: 'Thanh toán cho Thiên Kim — Task: Panel A4',
    createdAt: '2026-06-03T11:00:00Z',
  },
  {
    id: 'tx-13', type: 'Lock', amount: -420000,
    setupFundAmount: -420000, withdrawableAmount: 0,
    referenceId: 't-9', referenceCode: 'TASK-009',
    description: 'Lock tiền cho Task: Panel A4',
    createdAt: '2026-06-02T09:00:00Z',
  },
  {
    id: 'tx-14', type: 'Unlock', amount: 280000,
    setupFundAmount: 280000, withdrawableAmount: 0,
    referenceId: 't-6', referenceCode: 'TASK-006',
    description: 'Hoàn tiền Task bị hủy: Effect D1',
    createdAt: '2026-06-02T16:00:00Z',
  },
  {
    id: 'tx-15', type: 'Funding', amount: 3000000,
    setupFundAmount: 3000000, withdrawableAmount: 0,
    referenceId: 'fund-2', referenceCode: 'FUND-002',
    description: 'Board cấp vốn cho Series "Đỉnh Cao Ma Pháp"',
    createdAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 'tx-16', type: 'Transfer', amount: -450000,
    setupFundAmount: -450000, withdrawableAmount: 0,
    referenceId: 't-3', referenceCode: 'TASK-003',
    description: 'Thanh toán cho Đức Minh — Task: Character C1',
    createdAt: '2026-06-01T12:00:00Z',
  },
];
