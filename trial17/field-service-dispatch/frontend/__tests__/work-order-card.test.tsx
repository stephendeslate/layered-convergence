import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { WorkOrderCard } from '@/components/work-orders/work-order-card';
import type { WorkOrder } from '@/lib/types';

expect.extend(toHaveNoViolations);

const mockWorkOrder: WorkOrder = {
  id: 'wo-1',
  title: 'Fix AC Unit',
  description: 'The AC is not cooling properly',
  status: 'ASSIGNED',
  priority: 'HIGH',
  scheduledAt: '2024-01-15T10:00:00Z',
  completedAt: null,
  companyId: 'company-1',
  technicianId: 'tech-1',
  technician: { id: 'tech-1', email: 'tech@test.com', name: 'John Tech', phone: null, skills: [], availability: 'AVAILABLE', latitude: null, longitude: null, companyId: 'company-1', createdAt: '', updatedAt: '' },
  customerId: 'cust-1',
  customer: { id: 'cust-1', name: 'Jane Customer', email: null, phone: null, address: '123 Main St', latitude: null, longitude: null, companyId: 'company-1', createdAt: '', updatedAt: '' },
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-01-10T00:00:00Z',
};

describe('WorkOrderCard', () => {
  it('renders work order title', () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText('Fix AC Unit')).toBeInTheDocument();
  });

  it('renders status and priority badges', () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByLabelText('Status: Assigned')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority: High')).toBeInTheDocument();
  });

  it('renders technician and customer names', () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText(/John Tech/)).toBeInTheDocument();
    expect(screen.getByText(/Jane Customer/)).toBeInTheDocument();
  });

  it('renders description when present', () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText('The AC is not cooling properly')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<WorkOrderCard workOrder={mockWorkOrder} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
