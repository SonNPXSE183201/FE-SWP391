import type {
  ReconciliationRecordDto,
  ReconciliationResponseDto,
  ReconciliationSummaryDto,
} from '../../../api/generated/types';

/** Trạng thái đối soát — union FE để type-safe filter/badge */
export type ReconciliationStatus = 'Matched' | 'Mismatch' | 'Missing' | 'Pending';

export type ReconciliationRecord = ReconciliationRecordDto;
export type ReconciliationSummary = ReconciliationSummaryDto;
export type ReconciliationResponse = ReconciliationResponseDto;

/** Query params cho GET /api/admin/reconciliation (không có trong OpenAPI) */
export interface ReconciliationParams {
  from?: string;
  to?: string;
  status?: ReconciliationStatus | 'All';
  referenceCode?: string;
}

export const toReconciliationStatus = (status?: string | null): ReconciliationStatus => {
  if (status === 'Matched' || status === 'Mismatch' || status === 'Missing' || status === 'Pending') {
    return status;
  }
  return 'Pending';
};
