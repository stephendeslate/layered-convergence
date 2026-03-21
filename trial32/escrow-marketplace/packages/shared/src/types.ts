/**
 * Shared TypeScript types for the Escrow Marketplace platform.
 */

export enum Role {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ARBITER = 'ARBITER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  FUNDED = 'FUNDED',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
}

export interface UserDto {
  id: string;
  email: string;
  role: Role;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDto {
  id: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  buyerId: string;
  sellerId: string;
  tenantId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeDto {
  id: string;
  reason: string;
  status: DisputeStatus;
  transactionId: string;
  filedById: string;
  tenantId: string;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutDto {
  id: string;
  amount: string;
  currency: string;
  recipientId: string;
  transactionId: string;
  tenantId: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDto {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: Role;
  tenantId: string;
}

export interface AuthResponse {
  accessToken: string;
}
