'use server';

import { revalidatePath } from 'next/cache';
import { apiPost, apiPatch } from '@/lib/api';
import type { WorkOrderStatus, WorkOrderPriority } from '@/lib/types';

interface ActionResult {
  error?: string;
  success?: boolean;
}

const VALID_STATUSES: WorkOrderStatus[] = [
  'CREATED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS',
  'ON_HOLD', 'COMPLETED', 'INVOICED', 'PAID', 'CLOSED',
];

const VALID_PRIORITIES: WorkOrderPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function validateString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  return value.trim();
}

export async function createWorkOrder(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const title = validateString(formData, 'title');
  if (!title) {
    return { error: 'Title is required' };
  }

  const description = validateString(formData, 'description');
  if (!description) {
    return { error: 'Description is required' };
  }

  const customerId = validateString(formData, 'customerId');
  if (!customerId) {
    return { error: 'Customer is required' };
  }

  const technicianId = validateString(formData, 'technicianId');
  const priorityRaw = validateString(formData, 'priority');
  let priority: WorkOrderPriority = 'MEDIUM';
  if (priorityRaw) {
    if (!VALID_PRIORITIES.includes(priorityRaw as WorkOrderPriority)) {
      return { error: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' };
    }
    priority = priorityRaw as WorkOrderPriority;
  }

  try {
    await apiPost('/work-orders', {
      title,
      description,
      customerId,
      priority,
      ...(technicianId ? { technicianId } : {}),
    });

    revalidatePath('/');
    revalidatePath('/work-orders');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create work order';
    return { error: message };
  }
}

export async function transitionWorkOrder(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const workOrderId = validateString(formData, 'workOrderId');
  if (!workOrderId) {
    return { error: 'Work order ID is required' };
  }

  const status = validateString(formData, 'status');
  if (!status || !VALID_STATUSES.includes(status as WorkOrderStatus)) {
    return { error: 'Invalid status' };
  }

  try {
    await apiPatch(`/work-orders/${encodeURIComponent(workOrderId)}/transition`, {
      status,
    });

    revalidatePath('/');
    revalidatePath('/work-orders');
    revalidatePath(`/work-orders/${workOrderId}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to transition work order';
    return { error: message };
  }
}

export async function assignTechnician(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const workOrderId = validateString(formData, 'workOrderId');
  if (!workOrderId) {
    return { error: 'Work order ID is required' };
  }

  const technicianId = validateString(formData, 'technicianId');
  if (!technicianId) {
    return { error: 'Technician is required' };
  }

  try {
    await apiPatch(`/work-orders/${encodeURIComponent(workOrderId)}/assign`, {
      technicianId,
    });

    revalidatePath('/');
    revalidatePath('/work-orders');
    revalidatePath(`/work-orders/${workOrderId}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to assign technician';
    return { error: message };
  }
}

export async function createRoute(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const name = validateString(formData, 'name');
  if (!name) {
    return { error: 'Route name is required' };
  }

  const date = validateString(formData, 'date');
  if (!date) {
    return { error: 'Date is required' };
  }

  const technicianId = validateString(formData, 'technicianId');
  if (!technicianId) {
    return { error: 'Technician is required' };
  }

  const waypointsRaw = validateString(formData, 'waypoints');
  if (!waypointsRaw) {
    return { error: 'At least one waypoint is required' };
  }

  let waypoints: Array<{ latitude: number; longitude: number; address?: string; workOrderId?: string }>;
  try {
    waypoints = JSON.parse(waypointsRaw);
    if (!Array.isArray(waypoints) || waypoints.length === 0) {
      return { error: 'At least one waypoint is required' };
    }
    for (const wp of waypoints) {
      if (typeof wp.latitude !== 'number' || typeof wp.longitude !== 'number') {
        return { error: 'Each waypoint must have latitude and longitude' };
      }
    }
  } catch {
    return { error: 'Invalid waypoints data' };
  }

  try {
    await apiPost('/routes', { name, date, technicianId, waypoints });

    revalidatePath('/routes');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create route';
    return { error: message };
  }
}
