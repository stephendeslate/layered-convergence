import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { WorkOrderStatus, WorkOrderPriority } from './types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  CREATED: 'Created',
  ASSIGNED: 'Assigned',
  EN_ROUTE: 'En Route',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  INVOICED: 'Invoiced',
  PAID: 'Paid',
  CLOSED: 'Closed',
};

export function statusLabel(status: WorkOrderStatus): string {
  return STATUS_LABELS[status] ?? status;
}

const PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export function priorityLabel(priority: WorkOrderPriority): string {
  return PRIORITY_LABELS[priority] ?? priority;
}
