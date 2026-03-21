import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateRequiredString(formData: FormData, field: string): string {
  const value = formData.get(field);
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

export function validateOptionalString(formData: FormData, field: string): string | undefined {
  const value = formData.get(field);
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function getStatusBadgeVariant(status: string): 'pending' | 'assigned' | 'inProgress' | 'onHold' | 'completed' | 'invoiced' | 'default' {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'ASSIGNED':
      return 'assigned';
    case 'IN_PROGRESS':
      return 'inProgress';
    case 'ON_HOLD':
      return 'onHold';
    case 'COMPLETED':
      return 'completed';
    case 'INVOICED':
      return 'invoiced';
    default:
      return 'default';
  }
}

export function getAvailabilityBadgeVariant(availability: string): 'available' | 'onJob' | 'offDuty' | 'default' {
  switch (availability) {
    case 'AVAILABLE':
      return 'available';
    case 'ON_JOB':
      return 'onJob';
    case 'OFF_DUTY':
      return 'offDuty';
    default:
      return 'default';
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatStatus(status: string): string {
  return status.replace(/_/g, ' ');
}
