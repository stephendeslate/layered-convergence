// TRACED: FD-UI-ACT-001 — Server actions for work order and technician mutations
// TRACED: FD-UI-ACT-002 — Server action response.ok check and input sanitization
'use server';

import { sanitizeInput } from '@field-service-dispatch/shared';

interface ActionResult {
  success: boolean;
  message: string;
}

export async function createWorkOrderAction(formData: FormData): Promise<ActionResult> {
  const title = formData.get('title');
  const description = formData.get('description');
  const priority = formData.get('priority');
  const tenantId = formData.get('tenantId');

  if (!title || typeof title !== 'string') {
    return { success: false, message: 'Title is required' };
  }

  if (!tenantId || typeof tenantId !== 'string') {
    return { success: false, message: 'Tenant ID is required' };
  }

  const sanitizedTitle = sanitizeInput(title);
  const sanitizedDescription =
    description && typeof description === 'string' ? sanitizeInput(description) : '';

  const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

  const response = await fetch(`${apiUrl}/work-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: sanitizedTitle,
      description: sanitizedDescription,
      priority: typeof priority === 'string' ? priority : 'MEDIUM',
      tenantId,
    }),
  });

  if (!response.ok) {
    return { success: false, message: 'Failed to create work order' };
  }

  return { success: true, message: 'Work order created successfully' };
}

export async function updateWorkOrderStatusAction(
  workOrderId: string,
  status: string,
  tenantId: string,
): Promise<ActionResult> {
  if (!workOrderId || !status || !tenantId) {
    return { success: false, message: 'Missing required fields' };
  }

  const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

  const response = await fetch(`${apiUrl}/work-orders/${workOrderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    return { success: false, message: 'Failed to update work order status' };
  }

  return { success: true, message: `Work order status updated to ${status}` };
}

export async function createTechnicianAction(formData: FormData): Promise<ActionResult> {
  const name = formData.get('name');
  const specialty = formData.get('specialty');
  const latitude = formData.get('latitude');
  const longitude = formData.get('longitude');
  const tenantId = formData.get('tenantId');

  if (!name || typeof name !== 'string') {
    return { success: false, message: 'Name is required' };
  }

  if (!tenantId || typeof tenantId !== 'string') {
    return { success: false, message: 'Tenant ID is required' };
  }

  const sanitizedName = sanitizeInput(name);

  const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

  const response = await fetch(`${apiUrl}/technicians`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: sanitizedName,
      specialty: typeof specialty === 'string' ? specialty : 'General',
      latitude: typeof latitude === 'string' ? latitude : '0.0000000',
      longitude: typeof longitude === 'string' ? longitude : '0.0000000',
      tenantId,
    }),
  });

  if (!response.ok) {
    return { success: false, message: 'Failed to create technician' };
  }

  return { success: true, message: 'Technician created successfully' };
}
