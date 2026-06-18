// ─── Reconciliation Types ────────────────────────────────────

export type ReconciliationStatus = 'Matched' | 'Mismatch' | 'Missing' | 'Pending';

export interface ReconciliationRecord {
  id: string;
  referenceCode: string;
  vnpayTransactionId: string;
  internalTransactionId: string;
  vnpayAmount: number;
  internalAmount: number;
  vnpayDate: string;
  internalDate: string;
  vnpayStatus: string;
  internalStatus: string;
  status: ReconciliationStatus;
  userName: string;
  description: string;
  discrepancyNote?: string;
}

export interface ReconciliationSummary {
  totalRecords: number;
  matchedCount: number;
  mismatchCount: number;
  missingCount: number;
  pendingCount: number;
  totalVnpayAmount: number;
  totalInternalAmount: number;
  differenceAmount: number;
}

export interface ReconciliationParams {
  from?: string;
  to?: string;
  status?: ReconciliationStatus | 'All';
  referenceCode?: string;
}

export interface ReconciliationResponse {
  records: ReconciliationRecord[];
  summary: ReconciliationSummary;
}
