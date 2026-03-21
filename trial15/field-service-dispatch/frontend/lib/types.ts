export type WorkOrderStatus =
  | "CREATED"
  | "ASSIGNED"
  | "EN_ROUTE"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "INVOICED"
  | "PAID"
  | "CLOSED";

export const WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  "CREATED",
  "ASSIGNED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "INVOICED",
  "PAID",
  "CLOSED",
];

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Company {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Technician {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: "AVAILABLE" | "BUSY" | "OFFLINE";
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  companyId: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: Priority;
  customerId: string;
  customer?: Customer;
  technicianId: string | null;
  technician?: Technician;
  scheduledDate: string | null;
  estimatedDuration: number | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  companyId: string;
  technicianId: string;
  technician?: Technician;
  date: string;
  workOrderIds: string[];
  workOrders?: WorkOrder[];
  totalDistance: number;
  estimatedDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  workOrderId: string;
  workOrder?: WorkOrder;
  amount: number;
  tax: number;
  total: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    companyId: string;
  };
}

export interface GpsUpdate {
  technicianId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface StatusCounts {
  CREATED: number;
  ASSIGNED: number;
  EN_ROUTE: number;
  IN_PROGRESS: number;
  ON_HOLD: number;
  COMPLETED: number;
  INVOICED: number;
  PAID: number;
  CLOSED: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
