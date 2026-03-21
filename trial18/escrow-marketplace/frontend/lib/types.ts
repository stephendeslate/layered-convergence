export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export type TransactionStatus =
  | 'PENDING'
  | 'FUNDED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'RELEASED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Transaction {
  id: string;
  title: string;
  description: string | null;
  amount: string;
  status: TransactionStatus;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  buyer?: User;
  seller?: User;
}

export interface Dispute {
  id: string;
  reason: string;
  resolution: string | null;
  transactionId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  transaction?: Transaction;
  user?: User;
}

export interface Payout {
  id: string;
  amount: string;
  transactionId: string;
  recipientId: string;
  completedAt: string | null;
  createdAt: string;
  transaction?: Transaction;
}

export interface ActionState {
  error: string | null;
  success: boolean;
}
