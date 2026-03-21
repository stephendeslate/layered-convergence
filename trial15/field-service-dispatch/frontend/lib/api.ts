import { cookies } from "next/headers";
import type {
  AuthResponse,
  Company,
  Customer,
  Invoice,
  Route,
  Technician,
  WorkOrder,
} from "./types";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001";

class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: options.cache ?? "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `Request failed with status ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody) as { message?: string };
      if (parsed.message) {
        message = parsed.message;
      }
    } catch {
      // Use default message
    }
    throw new ApiClientError(message, response.status);
  }

  return response.json() as Promise<T>;
}

// Auth
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new ApiClientError("Invalid credentials", response.status);
  }

  return response.json() as Promise<AuthResponse>;
}

export async function register(
  email: string,
  password: string,
  companyName: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, companyName }),
  });

  if (!response.ok) {
    throw new ApiClientError("Registration failed", response.status);
  }

  return response.json() as Promise<AuthResponse>;
}

// Companies
export async function createCompany(data: {
  name: string;
}): Promise<Company> {
  return request<Company>("/companies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCompanies(): Promise<Company[]> {
  return request<Company[]>("/companies");
}

// Technicians
export async function getTechnicians(): Promise<Technician[]> {
  return request<Technician[]>("/technicians");
}

export async function getTechnician(id: string): Promise<Technician> {
  return request<Technician>(`/technicians/${id}`);
}

export async function createTechnician(data: {
  name: string;
  email: string;
  phone: string;
  skills: string[];
}): Promise<Technician> {
  return request<Technician>("/technicians", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  return request<Customer[]>("/customers");
}

export async function createCustomer(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
}): Promise<Customer> {
  return request<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Work Orders
export async function getWorkOrders(
  status?: string
): Promise<WorkOrder[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<WorkOrder[]>(`/work-orders${query}`);
}

export async function getWorkOrder(id: string): Promise<WorkOrder> {
  return request<WorkOrder>(`/work-orders/${id}`);
}

export async function createWorkOrder(data: {
  title: string;
  description: string;
  priority: string;
  customerId: string;
  address: string;
  scheduledDate?: string;
  estimatedDuration?: number;
  notes?: string;
}): Promise<WorkOrder> {
  return request<WorkOrder>("/work-orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function transitionWorkOrder(
  id: string,
  action: string,
  data?: Record<string, string>
): Promise<WorkOrder> {
  return request<WorkOrder>(`/work-orders/${id}/${action}`, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

// Routes
export async function getRoutes(): Promise<Route[]> {
  return request<Route[]>("/routes");
}

export async function createRoute(data: {
  technicianId: string;
  date: string;
  workOrderIds: string[];
}): Promise<Route> {
  return request<Route>("/routes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Invoices
export async function getInvoices(): Promise<Invoice[]> {
  return request<Invoice[]>("/invoices");
}

export async function createInvoice(data: {
  workOrderId: string;
  amount: number;
  tax: number;
  dueDate: string;
}): Promise<Invoice> {
  return request<Invoice>("/invoices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
