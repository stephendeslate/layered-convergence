import { z } from 'zod';
import {
  UserRole,
  TransactionStatus,
  DisputeReason,
  DisputeStatus,
} from './enums';

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be at most 100 characters'),
  role: z.enum([UserRole.BUYER, UserRole.PROVIDER]),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Transaction Schemas ─────────────────────────────────────────────────────

export const createTransactionSchema = z.object({
  providerId: z.string().cuid('Invalid provider ID'),
  amount: z
    .number()
    .int('Amount must be a whole number (cents)')
    .min(500, 'Minimum amount is $5.00')
    .max(1000000, 'Maximum amount is $10,000.00'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),
});

// ─── Dispute Schemas ─────────────────────────────────────────────────────────

export const createDisputeSchema = z.object({
  transactionId: z.string().cuid('Invalid transaction ID'),
  reason: z.nativeEnum(DisputeReason),
  description: z
    .string()
    .min(20, 'Dispute description must be at least 20 characters')
    .max(2000, 'Dispute description must be at most 2000 characters'),
});

export const submitEvidenceSchema = z.object({
  content: z
    .string()
    .min(10, 'Evidence must be at least 10 characters')
    .max(5000, 'Evidence must be at most 5000 characters'),
  fileUrl: z.string().url().optional(),
  fileName: z.string().max(255).optional(),
  fileSize: z
    .number()
    .int()
    .max(10485760, 'File size must be 10MB or less')
    .optional(),
});

export const resolveDisputeSchema = z.object({
  resolution: z.enum([
    DisputeStatus.RESOLVED_RELEASED,
    DisputeStatus.RESOLVED_REFUNDED,
    DisputeStatus.ESCALATED,
  ]),
  resolutionNote: z
    .string()
    .min(10, 'Resolution note must be at least 10 characters')
    .max(2000, 'Resolution note must be at most 2000 characters'),
});

// ─── Pagination Schema ───────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type SubmitEvidenceInput = z.infer<typeof submitEvidenceSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
