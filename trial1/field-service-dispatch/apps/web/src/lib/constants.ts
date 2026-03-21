import {
  WorkOrderStatus,
  TechnicianStatus,
  Priority,
  InvoiceStatus,
} from '@fsd/shared';

export const STATUS_COLORS: Record<WorkOrderStatus, { bg: string; text: string; border: string }> = {
  [WorkOrderStatus.UNASSIGNED]: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  [WorkOrderStatus.ASSIGNED]: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  [WorkOrderStatus.EN_ROUTE]: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  [WorkOrderStatus.ON_SITE]: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  [WorkOrderStatus.IN_PROGRESS]: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  [WorkOrderStatus.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  [WorkOrderStatus.INVOICED]: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  [WorkOrderStatus.PAID]: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300' },
  [WorkOrderStatus.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  [Priority.LOW]: { bg: 'bg-gray-100', text: 'text-gray-700' },
  [Priority.NORMAL]: { bg: 'bg-blue-100', text: 'text-blue-700' },
  [Priority.HIGH]: { bg: 'bg-orange-100', text: 'text-orange-700' },
  [Priority.URGENT]: { bg: 'bg-red-100', text: 'text-red-700' },
};

export const TECH_STATUS_COLORS: Record<TechnicianStatus, { dot: string; label: string; mapColor: string }> = {
  [TechnicianStatus.AVAILABLE]: { dot: 'bg-green-500', label: 'Available', mapColor: '#22C55E' },
  [TechnicianStatus.EN_ROUTE]: { dot: 'bg-blue-500', label: 'En Route', mapColor: '#3B82F6' },
  [TechnicianStatus.ON_JOB]: { dot: 'bg-orange-500', label: 'On Job', mapColor: '#F97316' },
  [TechnicianStatus.ON_BREAK]: { dot: 'bg-yellow-500', label: 'On Break', mapColor: '#EAB308' },
  [TechnicianStatus.OFF_DUTY]: { dot: 'bg-gray-400', label: 'Off Duty', mapColor: '#9CA3AF' },
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, { bg: string; text: string }> = {
  [InvoiceStatus.DRAFT]: { bg: 'bg-gray-100', text: 'text-gray-700' },
  [InvoiceStatus.SENT]: { bg: 'bg-blue-100', text: 'text-blue-700' },
  [InvoiceStatus.PAID]: { bg: 'bg-green-100', text: 'text-green-700' },
  [InvoiceStatus.VOID]: { bg: 'bg-red-100', text: 'text-red-700' },
  [InvoiceStatus.OVERDUE]: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

// Kanban columns to display on the dispatch board
export const KANBAN_COLUMNS: WorkOrderStatus[] = [
  WorkOrderStatus.UNASSIGNED,
  WorkOrderStatus.ASSIGNED,
  WorkOrderStatus.EN_ROUTE,
  WorkOrderStatus.ON_SITE,
  WorkOrderStatus.IN_PROGRESS,
  WorkOrderStatus.COMPLETED,
];

export const PRIORITY_MAP_COLORS: Record<Priority, string> = {
  [Priority.LOW]: '#9CA3AF',
  [Priority.NORMAL]: '#3B82F6',
  [Priority.HIGH]: '#F97316',
  [Priority.URGENT]: '#EF4444',
};
