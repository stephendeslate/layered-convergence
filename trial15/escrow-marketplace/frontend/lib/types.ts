export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export type TransactionStatus =
  | "PENDING"
  | "FUNDED"
  | "SHIPPED"
  | "DELIVERED"
  | "RELEASED"
  | "CANCELLED"
  | "DISPUTED"
  | "RESOLVED"
  | "REFUNDED";

export interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  buyerId: string;
  sellerId: string;
  buyer: User;
  seller: User;
  createdAt: string;
  updatedAt: string;
  fundedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  releasedAt: string | null;
  cancelledAt: string | null;
  disputedAt: string | null;
  resolvedAt: string | null;
}

export interface CreateTransactionInput {
  title: string;
  description: string;
  amount: number;
  currency: string;
  sellerId: string;
}

export type TransactionTransition =
  | "fund"
  | "ship"
  | "deliver"
  | "release"
  | "cancel"
  | "dispute";

export interface Dispute {
  id: string;
  transactionId: string;
  transaction: Transaction;
  reason: string;
  evidence: string;
  resolution: string | null;
  status: "OPEN" | "RESOLVED";
  filedBy: string;
  filedByUser: User;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface CreateDisputeInput {
  transactionId: string;
  reason: string;
  evidence: string;
}

export interface ResolveDisputeInput {
  resolution: string;
  outcome: "RELEASE" | "REFUND";
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  stripePayoutId: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface StripeAccount {
  id: string;
  userId: string;
  stripeAccountId: string;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface StatusCounts {
  PENDING: number;
  FUNDED: number;
  SHIPPED: number;
  DELIVERED: number;
  RELEASED: number;
  CANCELLED: number;
  DISPUTED: number;
  RESOLVED: number;
  REFUNDED: number;
}
