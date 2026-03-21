// [TRACED:UI-001] Frontend TypeScript interfaces matching backend domain models
export type Role = 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN';

export type TechnicianAvailability = 'AVAILABLE' | 'ON_JOB' | 'OFF_DUTY';

export type WorkOrderStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'INVOICED';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export interface User {
  id: string;
  email: string;
  role: Role;
  companyId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  companyId: string;
}

export interface Technician {
  id: string;
  userId: string;
  skills: string[];
  availability: TechnicianAvailability;
  companyId: string;
  user?: { email: string };
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: number;
  customerId: string;
  technicianId: string | null;
  companyId: string;
  scheduledAt: string | null;
  completedAt: string | null;
  customer?: { name: string };
  technician?: { id: string; user: { email: string } } | null;
}

export interface Route {
  id: string;
  technicianId: string;
  workOrderId: string;
  distance: number;
  estimatedMinutes: number;
  companyId: string;
  technician?: { user: { email: string } };
  workOrder?: { title: string };
}

export interface GpsEvent {
  id: string;
  technicianId: string;
  lat: number;
  lng: number;
  timestamp: string;
  companyId: string;
  technician?: { user: { email: string } };
}

export interface Invoice {
  id: string;
  workOrderId: string;
  amount: string;
  tax: string;
  total: string;
  status: InvoiceStatus;
  companyId: string;
  workOrder?: { title: string; customer?: { name: string } };
}

export interface ActionState {
  error?: string;
  success?: boolean;
}
