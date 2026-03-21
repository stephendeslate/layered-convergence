export type WorkOrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'INVOICED'
  | 'PAID'
  | 'CLOSED';

export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TechnicianAvailability = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';

export interface Company {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  scheduledAt: string | null;
  completedAt: string | null;
  customerId: string;
  customer: Customer;
  technicianId: string | null;
  technician: Technician | null;
  companyId: string;
  invoices: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: TechnicianAvailability;
  latitude: number | null;
  longitude: number | null;
  companyId: string;
  workOrders: WorkOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Waypoint {
  latitude: number;
  longitude: number;
  address?: string;
  workOrderId?: string;
}

export interface Route {
  id: string;
  name: string;
  date: string;
  distance: number;
  estimatedTime: number;
  technicianId: string;
  technician?: Technician;
  waypoints: Waypoint[];
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  notes: string | null;
  workOrderId: string;
  workOrder?: WorkOrder;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GpsEvent {
  id: string;
  technicianId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  companyId: string;
}

export interface StatusCounts {
  status: WorkOrderStatus;
  _count: number;
}
