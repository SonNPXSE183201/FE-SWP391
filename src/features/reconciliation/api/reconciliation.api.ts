import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/generated/types';
import type {
  ReconciliationRecord,
  ReconciliationSummary,
  ReconciliationParams,
  ReconciliationResponse,
} from '../types/reconciliation.types';

// ─── Config ──────────────────────────────────────────────────

const USE_MOCK = false;
const mockDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_RECORDS: ReconciliationRecord[] = [
  {
    id: 'r1',
    referenceCode: 'VNPAY-20260610-001',
    vnpayTransactionId: 'VNP14052312',
    internalTransactionId: 'TXN-000142',
    vnpayAmount: 5000000,
    internalAmount: 5000000,
    vnpayDate: '2026-06-10T09:15:00Z',
    internalDate: '2026-06-10T09:15:02Z',
    vnpayStatus: 'Success',
    internalStatus: 'Completed',
    status: 'Matched',
    userName: 'Nguyễn Minh Hùng',
    description: 'Nạp tiền vào ví — Deposit',
  },
  {
    id: 'r2',
    referenceCode: 'VNPAY-20260610-002',
    vnpayTransactionId: 'VNP14052398',
    internalTransactionId: 'TXN-000143',
    vnpayAmount: 2000000,
    internalAmount: 2500000,
    vnpayDate: '2026-06-10T10:30:00Z',
    internalDate: '2026-06-10T10:30:05Z',
    vnpayStatus: 'Success',
    internalStatus: 'Completed',
    status: 'Mismatch',
    userName: 'Lê Thị Hoa',
    description: 'Nạp tiền vào ví — Deposit',
    discrepancyNote: 'Chênh lệch 500.000 VNĐ: VNPay ghi nhận 2.000.000 nhưng hệ thống ghi 2.500.000. Cần kiểm tra lại callback xử lý.',
  },
  {
    id: 'r3',
    referenceCode: 'VNPAY-20260611-001',
    vnpayTransactionId: 'VNP14053001',
    internalTransactionId: '',
    vnpayAmount: 1000000,
    internalAmount: 0,
    vnpayDate: '2026-06-11T14:20:00Z',
    internalDate: '',
    vnpayStatus: 'Success',
    internalStatus: 'Not Found',
    status: 'Missing',
    userName: 'Trần Thanh Tâm',
    description: 'Nạp tiền — VNPay ghi nhận nhưng hệ thống không có record',
    discrepancyNote: 'Giao dịch VNPay thành công nhưng không tìm thấy giao dịch tương ứng trong hệ thống. Khả năng callback bị lỗi hoặc timeout.',
  },
  {
    id: 'r4',
    referenceCode: 'VNPAY-20260611-002',
    vnpayTransactionId: 'VNP14053088',
    internalTransactionId: 'TXN-000150',
    vnpayAmount: 3000000,
    internalAmount: 3000000,
    vnpayDate: '2026-06-11T16:45:00Z',
    internalDate: '2026-06-11T16:45:01Z',
    vnpayStatus: 'Success',
    internalStatus: 'Completed',
    status: 'Matched',
    userName: 'Phạm Hữu Đức',
    description: 'Nạp tiền vào ví — Deposit',
  },
  {
    id: 'r5',
    referenceCode: 'VNPAY-20260612-001',
    vnpayTransactionId: 'VNP14053155',
    internalTransactionId: 'TXN-000155',
    vnpayAmount: 10000000,
    internalAmount: 10000000,
    vnpayDate: '2026-06-12T08:00:00Z',
    internalDate: '2026-06-12T08:00:03Z',
    vnpayStatus: 'Pending',
    internalStatus: 'Processing',
    status: 'Pending',
    userName: 'Hoàng Anh Tuấn',
    description: 'Nạp tiền — Đang chờ xác nhận',
  },
  {
    id: 'r6',
    referenceCode: 'VNPAY-20260612-002',
    vnpayTransactionId: 'VNP14053210',
    internalTransactionId: 'TXN-000156',
    vnpayAmount: 7500000,
    internalAmount: 7500000,
    vnpayDate: '2026-06-12T11:20:00Z',
    internalDate: '2026-06-12T11:20:01Z',
    vnpayStatus: 'Success',
    internalStatus: 'Completed',
    status: 'Matched',
    userName: 'Nguyễn Minh Hùng',
    description: 'Nạp tiền vào ví — Deposit',
  },
  {
    id: 'r7',
    referenceCode: 'VNPAY-20260613-001',
    vnpayTransactionId: 'VNP14053399',
    internalTransactionId: 'TXN-000160',
    vnpayAmount: 4000000,
    internalAmount: 4200000,
    vnpayDate: '2026-06-13T09:10:00Z',
    internalDate: '2026-06-13T09:10:02Z',
    vnpayStatus: 'Success',
    internalStatus: 'Completed',
    status: 'Mismatch',
    userName: 'Lê Thị Hoa',
    description: 'Nạp tiền vào ví — Deposit',
    discrepancyNote: 'Chênh lệch 200.000 VNĐ: nghi phí giao dịch chưa được trừ đúng.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────

const calculateSummary = (records: ReconciliationRecord[]): ReconciliationSummary => ({
  totalRecords: records.length,
  matchedCount: records.filter((r) => r.status === 'Matched').length,
  mismatchCount: records.filter((r) => r.status === 'Mismatch').length,
  missingCount: records.filter((r) => r.status === 'Missing').length,
  pendingCount: records.filter((r) => r.status === 'Pending').length,
  totalVnpayAmount: records.reduce((sum, r) => sum + r.vnpayAmount, 0),
  totalInternalAmount: records.reduce((sum, r) => sum + r.internalAmount, 0),
  differenceAmount: Math.abs(
    records.reduce((sum, r) => sum + r.vnpayAmount, 0) - records.reduce((sum, r) => sum + r.internalAmount, 0)
  ),
});

// ─── API ─────────────────────────────────────────────────────

export const reconciliationApi = {
  fetchReconciliation: async (params?: ReconciliationParams): Promise<ReconciliationResponse> => {
    if (USE_MOCK) {
      await mockDelay();
      let filtered = [...MOCK_RECORDS];
      if (params?.status && params.status !== 'All') {
        filtered = filtered.filter((r) => r.status === params.status);
      }
      if (params?.referenceCode) {
        filtered = filtered.filter((r) =>
          r.referenceCode.toLowerCase().includes(params.referenceCode!.toLowerCase()) ||
          r.vnpayTransactionId.toLowerCase().includes(params.referenceCode!.toLowerCase())
        );
      }
      if (params?.from) {
        filtered = filtered.filter((r) => new Date(r.vnpayDate) >= new Date(params.from!));
      }
      if (params?.to) {
        filtered = filtered.filter((r) => new Date(r.vnpayDate) <= new Date(params.to! + 'T23:59:59Z'));
      }
      return { records: filtered, summary: calculateSummary(filtered) };
    }
    const res = await axiosInstance.get<ApiResponse<ReconciliationResponse>>(
      '/api/admin/reconciliation',
      { params }
    );
    return res.data?.Data ?? { records: [], summary: calculateSummary([]) };
  },
};
