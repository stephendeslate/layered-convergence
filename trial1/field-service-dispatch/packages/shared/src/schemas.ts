import { z } from 'zod';
import {
  WorkOrderStatus,
  TechnicianStatus,
  Priority,
  InvoiceStatus,
  ServiceType,
  UserRole,
  NotificationChannel,
  NotificationType,
  LineItemType,
} from './enums';

// ============================================================
// Auth Schemas
// ============================================================

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  companyName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().optional(),
});

// ============================================================
// Work Order Schemas
// ============================================================

export const CreateWorkOrderSchema = z.object({
  customerId: z.string().cuid(),
  technicianId: z.string().cuid().optional(),
  serviceType: z.nativeEnum(ServiceType),
  priority: z.nativeEnum(Priority).default(Priority.NORMAL),
  description: z.string().optional(),
  notes: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  estimatedMinutes: z.number().int().positive().default(60),
});

export const UpdateWorkOrderSchema = CreateWorkOrderSchema.partial();

export const TransitionWorkOrderSchema = z.object({
  status: z.nativeEnum(WorkOrderStatus),
  notes: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// ============================================================
// Customer Schemas
// ============================================================

export const CreateCustomerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  notes: z.string().optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

// ============================================================
// Technician Schemas
// ============================================================

export const CreateTechnicianSchema = z.object({
  userId: z.string().cuid(),
  skills: z.array(z.nativeEnum(ServiceType)).min(1),
  maxJobsPerDay: z.number().int().positive().default(8),
  vehicleInfo: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
});

export const UpdateTechnicianStatusSchema = z.object({
  status: z.nativeEnum(TechnicianStatus),
});

// ============================================================
// GPS Schemas
// ============================================================

export const GpsPositionSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive(),
  heading: z.number().min(0).max(360).nullable(),
  speed: z.number().min(0).nullable(),
  timestamp: z.string().datetime(),
});

// ============================================================
// Invoice Schemas
// ============================================================

export const CreateLineItemSchema = z.object({
  type: z.nativeEnum(LineItemType),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number(),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateInvoiceSchema = z.object({
  notes: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  lineItems: z.array(CreateLineItemSchema).optional(),
});

// ============================================================
// Route Schemas
// ============================================================

export const OptimizeRouteSchema = z.object({
  technicianId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const DirectionsSchema = z.object({
  originLat: z.number().min(-90).max(90),
  originLng: z.number().min(-180).max(180),
  destLat: z.number().min(-90).max(90),
  destLng: z.number().min(-180).max(180),
});

// ============================================================
// Invoice Creation Schema
// ============================================================

export const CreateInvoiceSchema = z.object({
  workOrderId: z.string().cuid(),
  notes: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  lineItems: z.array(CreateLineItemSchema).min(1),
});

// ============================================================
// Assign Technician Schema
// ============================================================

export const AssignTechnicianSchema = z.object({
  technicianId: z.string().cuid(),
});

// ============================================================
// GPS Update Schema (for WebSocket events)
// ============================================================

export const GpsUpdateSchema = z.object({
  technicianId: z.string().cuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive(),
  heading: z.number().min(0).max(360).nullable(),
  speed: z.number().min(0).nullable(),
  timestamp: z.string().datetime(),
});

// ============================================================
// Route Optimization Request/Response Schemas
// ============================================================

export const RouteOptimizationRequestSchema = z.object({
  technicianId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  includeReturn: z.boolean().default(false),
});

export const WaypointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
