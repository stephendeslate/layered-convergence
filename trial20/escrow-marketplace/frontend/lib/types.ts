export interface User {
  id: string;
  email: string;
  role: 'BUYER' | 'SELLER';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export type TransactionStatus =
  | 'PENDING'
  | 'FUNDED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'RELEASED'
  | 'DISPUTED'
  | 'RESOLVED'
  | 'REFUNDED';

export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: string;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  buyer: User;
  seller: User;
}

export type DisputeStatus = 'OPEN' | 'RESOLVED';

export interface Dispute {
  id: string;
  transactionId: string;
  reason: string;
  status: DisputeStatus;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  transaction: Transaction;
}

export type PayoutStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Payout {
  id: string;
  recipientId: string;
  transactionId: string;
  amount: string;
  status: PayoutStatus;
  createdAt: string;
  updatedAt: string;
  recipient: User;
  transaction: Transaction;
}

export interface Webhook {
  id: string;
  url: string;
  event: string;
  payload: Record<string, unknown>;
  status: 'PENDING' | 'SENT' | 'FAILED';
  createdAt: string;
}

export interface ActionState {
  error?: string;
  success?: boolean;
}
