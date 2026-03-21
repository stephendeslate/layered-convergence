import type {
  UserRole,
  TransactionStatus,
  DisputeStatus,
  DisputeReason,
  PayoutStatus,
  OnboardingStatus,
  AuditAction,
} from './enums';

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── User Types ──────────────────────────────────────────────────────────────

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserDto;
  tokens: AuthTokens;
}

// ─── Transaction Types ───────────────────────────────────────────────────────

export interface TransactionDto {
  id: string;
  buyerId: string;
  providerId: string;
  amount: number;
  platformFee: number;
  providerAmount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  stripePaymentIntentId: string | null;
  paymentHeldAt: string | null;
  deliveredAt: string | null;
  releasedAt: string | null;
  paidOutAt: string | null;
  disputedAt: string | null;
  refundedAt: string | null;
  expiredAt: string | null;
  autoReleaseAt: string | null;
  createdAt: string;
  updatedAt: string;
  buyer?: UserDto;
  provider?: UserDto;
}

export interface TransactionStateHistoryDto {
  id: string;
  transactionId: string;
  fromStatus: TransactionStatus | null;
  toStatus: TransactionStatus;
  action: AuditAction;
  actorId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ─── Dispute Types ───────────────────────────────────────────────────────────

export interface DisputeDto {
  id: string;
  transactionId: string;
  filedById: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolvedById: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  evidence?: DisputeEvidenceDto[];
}

export interface DisputeEvidenceDto {
  id: string;
  disputeId: string;
  submittedById: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
}

// ─── Payout Types ────────────────────────────────────────────────────────────

export interface PayoutDto {
  id: string;
  transactionId: string;
  connectedAccountId: string;
  stripePayoutId: string | null;
  amount: number;
  status: PayoutStatus;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Onboarding Types ────────────────────────────────────────────────────────

export interface OnboardingStatusDto {
  onboardingStatus: OnboardingStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingUrl: string | null;
}

// ─── Analytics Types ─────────────────────────────────────────────────────────

export interface PlatformAnalytics {
  totalTransactions: number;
  totalVolumeCents: number;
  totalFeesCents: number;
  activeDisputes: number;
  disputeRate: number;
  transactionsByStatus: Record<TransactionStatus, number>;
  volumeByDay: Array<{
    date: string;
    volumeCents: number;
    count: number;
  }>;
}

// ─── Transaction State Machine ───────────────────────────────────────────────

/**
 * Valid state transitions for the transaction state machine.
 * Key = current status, Value = array of valid next statuses.
 */
export const VALID_TRANSITIONS: Record<
  TransactionStatus,
  TransactionStatus[]
> = {
  CREATED: ['PAYMENT_HELD', 'CANCELLED'] as TransactionStatus[],
  PAYMENT_HELD: ['DELIVERED', 'DISPUTED', 'EXPIRED', 'CANCELLED'] as TransactionStatus[],
  DELIVERED: ['RELEASED', 'DISPUTED'] as TransactionStatus[],
  RELEASED: ['PAID_OUT'] as TransactionStatus[],
  PAID_OUT: [] as TransactionStatus[],
  DISPUTED: ['RELEASED', 'REFUNDED'] as TransactionStatus[],
  REFUNDED: [] as TransactionStatus[],
  EXPIRED: [] as TransactionStatus[],
  CANCELLED: [] as TransactionStatus[],
} as const;

// Constants moved to ./constants.ts
