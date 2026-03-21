import { z } from 'zod';
import {
  ConnectorType,
  SyncSchedule,
  DashboardStatus,
  WidgetType,
  AggregationFunction,
  FieldType,
  FieldRole,
  SubscriptionTier,
  GroupingPeriod,
  DateRangePreset,
  ApiKeyType,
} from './enums';

// ─── Tenant ───────────────────────────────────────────────

export const CreateTenantSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const UpdateTenantThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().min(1).max(100).optional(),
  cornerRadius: z.number().int().min(0).max(32).optional(),
  logoUrl: z.string().url().nullable().optional(),
});

// ─── Data Source ──────────────────────────────────────────

export const CreateDataSourceSchema = z.object({
  name: z.string().min(1).max(255),
  connectorType: z.nativeEnum(ConnectorType),
  syncSchedule: z.nativeEnum(SyncSchedule).default(SyncSchedule.MANUAL),
});

export const FieldMappingSchema = z.object({
  sourceField: z.string().min(1).max(255),
  targetField: z.string().min(1).max(255),
  fieldType: z.nativeEnum(FieldType),
  fieldRole: z.nativeEnum(FieldRole),
  isRequired: z.boolean().default(false),
  isPii: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateFieldMappingsSchema = z.object({
  fieldMappings: z.array(FieldMappingSchema).min(1),
});

// ─── Dashboard ────────────────────────────────────────────

export const CreateDashboardSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  gridColumns: z.number().int().min(1).max(24).default(12),
});

export const UpdateDashboardSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  gridColumns: z.number().int().min(1).max(24).optional(),
});

// ─── Widget ───────────────────────────────────────────────

export const MetricFieldSchema = z.object({
  field: z.string().min(1),
  aggregation: z.nativeEnum(AggregationFunction),
});

export const CreateWidgetSchema = z.object({
  dataSourceId: z.string().cuid(),
  type: z.nativeEnum(WidgetType),
  title: z.string().min(1).max(255),
  subtitle: z.string().max(255).nullable().optional(),
  gridColumnStart: z.number().int().min(1).max(24).default(1),
  gridColumnSpan: z.number().int().min(1).max(24).default(6),
  gridRowStart: z.number().int().min(1).default(1),
  gridRowSpan: z.number().int().min(1).max(12).default(1),
  dimensionField: z.string().min(1),
  metricFields: z.array(MetricFieldSchema).min(1),
  dateRangePreset: z.nativeEnum(DateRangePreset).default(DateRangePreset.LAST_30_DAYS),
  dateRangeStart: z.coerce.date().nullable().optional(),
  dateRangeEnd: z.coerce.date().nullable().optional(),
  groupingPeriod: z.nativeEnum(GroupingPeriod).default(GroupingPeriod.DAILY),
  typeConfig: z.record(z.unknown()).default({}),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateWidgetSchema = CreateWidgetSchema.partial();

// ─── Embed Config ─────────────────────────────────────────

export const UpdateEmbedConfigSchema = z.object({
  allowedOrigins: z.array(z.string().url()).max(20),
  isEnabled: z.boolean(),
});

// ─── API Key ──────────────────────────────────────────────

export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(255).default('Default'),
  type: z.nativeEnum(ApiKeyType),
  expiresAt: z.coerce.date().nullable().optional(),
});

// ─── Auth ─────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RegisterSchema = CreateTenantSchema;

// ─── Pagination ───────────────────────────────────────────

export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
