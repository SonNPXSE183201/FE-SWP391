import type { PendingWithdrawal } from '../types/withdrawApproval.types';
import { getRoleBadgeStyle, getRoleLabel } from '../../../utils/roleDisplay';

export const getRequesterRole = (tx: PendingWithdrawal): string | null =>
  tx.requesterRole ?? null;

export const getRequesterRoleLabel = (tx: PendingWithdrawal): string =>
  getRoleLabel(getRequesterRole(tx));

export const getRequesterRoleStyle = (tx: PendingWithdrawal): string =>
  getRoleBadgeStyle(getRequesterRole(tx));
