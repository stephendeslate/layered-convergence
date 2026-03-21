export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export type TransactionStatus =
  | 'PENDING'
  | 'FUNDED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'RELEASED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'RESOLVED'
  | 'REFUNDED';

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  title: string;
  description: string | null;
  amount: string;
  platformFee: string;
  status: TransactionStatus;
  buyerId: string;
  sellerId: string;
  buyer: User;
  seller: User;
  disputes?: Dispute[];
  payouts?: Payout[];
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  transactionId: string;
  transaction: Transaction;
  filedById: string;
  filedBy: User;
  reason: string;
  evidence: string | null;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  transactionId: string;
  transaction: Transaction;
  userId: string;
  user: User;
  amount: string;
  platformFee: string;
  status: string;
  stripePayoutId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface StatusCounts {
  [key: string]: number;
}
