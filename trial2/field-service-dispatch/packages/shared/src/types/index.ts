import { UserRole, WorkOrderStatus, WorkOrderPriority, TechnicianStatus, InvoiceStatus } from '../enums/index.js';

export interface JwtPayload {
  sub: string;
  companyId: string;
  role: UserRole;
  email: string;
  iat?: number;
  exp?: number;
}

export interface PositionUpdate {
  technicianId: string;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  timestamp: string;
}

export interface EtaUpdate {
  workOrderId: string;
  etaMinutes: number;
  distanceMeters: number;
}

export interface WorkOrderSummary {
  id: string;
  title: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  serviceType: string;
  address: string;
  lat: number;
  lng: number;
  scheduledAt: string | null;
  customerName: string;
  technicianName: string | null;
}

export interface TechnicianSummary {
  id: string;
  name: string;
  skills: string[];
  status: TechnicianStatus;
  currentLat: number | null;
  currentLng: number | null;
}

export interface DispatchBoard {
  workOrders: WorkOrderSummary[];
  technicians: TechnicianSummary[];
  stats: {
    unassigned: number;
    assigned: number;
    enRoute: number;
    onSite: number;
    inProgress: number;
    completed: number;
    total: number;
  };
}

export interface RouteWaypoint {
  workOrderId: string;
  lat: number;
  lng: number;
  order: number;
  arrival?: number;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  amount: number;
  total: number;
  status: InvoiceStatus;
  workOrderId: string;
  createdAt: string;
  dueDate: string | null;
}
