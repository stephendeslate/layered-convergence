export type Role = 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN';

export type WorkOrderStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'INVOICED';

export type TechnicianAvailability = 'AVAILABLE' | 'ON_JOB' | 'OFF_DUTY';

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
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: TechnicianAvailability;
  companyId: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: number;
  scheduledAt: string | null;
  completedAt: string | null;
  customerId: string;
  technicianId: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  technician?: Technician;
}

export interface Route {
  id: string;
  name: string;
  date: string;
  distance: number;
  stops: number;
  technicianId: string;
  companyId: string;
  technician?: Technician;
}

export interface GpsEvent {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  technicianId: string;
  companyId: string;
}

export interface Invoice {
  id: string;
  amount: string;
  tax: string;
  total: string;
  workOrderId: string;
  companyId: string;
}

export interface ActionState {
  success?: boolean;
  error?: string;
}
