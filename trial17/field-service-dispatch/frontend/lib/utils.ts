import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { WorkOrderStatus, WorkOrderPriority, TechnicianAvailability } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function statusLabel(status: WorkOrderStatus): string {
  const labels: Record<WorkOrderStatus, string> = {
    CREATED: 'Created',
    ASSIGNED: 'Assigned',
    EN_ROUTE: 'En Route',
    IN_PROGRESS: 'In Progress',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
    INVOICED: 'Invoiced',
    CLOSED: 'Closed',
    CANCELLED: 'Cancelled',
  };
  return labels[status];
}

export function priorityLabel(priority: WorkOrderPriority): string {
  const labels: Record<WorkOrderPriority, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
  };
  return labels[priority];
}

export function availabilityLabel(availability: TechnicianAvailability): string {
  const labels: Record<TechnicianAvailability, string> = {
    AVAILABLE: 'Available',
    BUSY: 'Busy',
    OFF_DUTY: 'Off Duty',
    ON_LEAVE: 'On Leave',
  };
  return labels[availability];
}
