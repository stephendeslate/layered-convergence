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

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Transaction {
  id: string;
  title: string;
  description?: string;
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
  evidence?: string;
  resolution?: string;
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
  stripePayoutId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ActionState {
  error?: string;
  success?: boolean;
  data?: unknown;
}
