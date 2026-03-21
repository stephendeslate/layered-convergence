export type WorkOrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'INVOICED'
  | 'CLOSED'
  | 'CANCELLED';

export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TechnicianAvailability = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY' | 'ON_LEAVE';

export type UserRole = 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN' | 'VIEWER';

export interface WorkOrder {
  id: string;
  title: string;
  description: string | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  scheduledAt: string | null;
  completedAt: string | null;
  companyId: string;
  technicianId: string | null;
  technician: Technician | null;
  customerId: string | null;
  customer: Customer | null;
  invoices?: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export interface Technician {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  skills: string[];
  availability: TechnicianAvailability;
  latitude: number | null;
  longitude: number | null;
  companyId: string;
  workOrders?: WorkOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  companyId: string;
  workOrders?: WorkOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  name: string;
  date: string;
  companyId: string;
  technicianId: string | null;
  technician: Technician | null;
  waypoints: unknown;
  distance: number | null;
  estimatedTime: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: string;
  tax: string;
  total: string;
  notes: string | null;
  companyId: string;
  workOrderId: string;
  workOrder?: WorkOrder;
  issuedAt: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
