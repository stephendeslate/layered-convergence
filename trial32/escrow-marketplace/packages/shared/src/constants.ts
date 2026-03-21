/**
 * Shared constants for the Escrow Marketplace platform.
 */

import { TransactionStatus, DisputeStatus, Role } from './types';

/** Roles available for user registration (excludes ADMIN) */
export const REGISTERABLE_ROLES: Role[] = [Role.BUYER, Role.SELLER, Role.ARBITER];

/** All valid transaction status values */
export const TRANSACTION_STATUSES: TransactionStatus[] = [
  TransactionStatus.PENDING,
  TransactionStatus.FUNDED,
  TransactionStatus.RELEASED,
  TransactionStatus.DISPUTED,
  TransactionStatus.REFUNDED,
];

/** All valid dispute status values */
export const DISPUTE_STATUSES: DisputeStatus[] = [
  DisputeStatus.OPEN,
  DisputeStatus.UNDER_REVIEW,
  DisputeStatus.RESOLVED,
  DisputeStatus.ESCALATED,
];

/** Transaction state machine: allowed transitions */
export const TRANSACTION_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.PENDING]: [TransactionStatus.FUNDED],
  [TransactionStatus.FUNDED]: [TransactionStatus.RELEASED, TransactionStatus.DISPUTED],
  [TransactionStatus.RELEASED]: [],
  [TransactionStatus.DISPUTED]: [TransactionStatus.RELEASED, TransactionStatus.REFUNDED],
  [TransactionStatus.REFUNDED]: [],
};

/** Dispute state machine: allowed transitions */
export const DISPUTE_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  [DisputeStatus.OPEN]: [DisputeStatus.UNDER_REVIEW],
  [DisputeStatus.UNDER_REVIEW]: [DisputeStatus.RESOLVED, DisputeStatus.ESCALATED],
  [DisputeStatus.RESOLVED]: [],
  [DisputeStatus.ESCALATED]: [DisputeStatus.RESOLVED],
};

/** Supported currencies */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP'] as const;

/** Default page size for list endpoints */
export const DEFAULT_PAGE_SIZE = 20;
