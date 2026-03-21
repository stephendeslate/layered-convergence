import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StatusBoard } from '@/components/work-orders/status-board';
import type { WorkOrder } from '@/lib/types';

expect.extend(toHaveNoViolations);

const makeWorkOrder = (overrides: Partial<WorkOrder>): WorkOrder => ({
  id: 'wo-1',
  title: 'Test WO',
  description: null,
  status: 'CREATED',
  priority: 'MEDIUM',
  scheduledAt: null,
  completedAt: null,
  companyId: 'company-1',
  technicianId: null,
  technician: null,
  customerId: null,
  customer: null,
  createdAt: '2024-01-10T00:00:00Z',
  updatedAt: '2024-01-10T00:00:00Z',
  ...overrides,
});

describe('StatusBoard', () => {
  it('renders column headers', () => {
    render(<StatusBoard workOrders={[]} />);
    expect(screen.getByText(/Created/)).toBeInTheDocument();
    expect(screen.getByText(/Assigned/)).toBeInTheDocument();
    expect(screen.getByText(/In Progress/)).toBeInTheDocument();
  });

  it('shows work orders in correct columns', () => {
    const workOrders = [
      makeWorkOrder({ id: 'wo-1', title: 'Created WO', status: 'CREATED' }),
      makeWorkOrder({ id: 'wo-2', title: 'Assigned WO', status: 'ASSIGNED' }),
    ];
    render(<StatusBoard workOrders={workOrders} />);
    expect(screen.getByText('Created WO')).toBeInTheDocument();
    expect(screen.getByText('Assigned WO')).toBeInTheDocument();
  });

  it('shows empty message when no work orders in column', () => {
    render(<StatusBoard workOrders={[]} />);
    const emptyMessages = screen.getAllByText('No work orders');
    expect(emptyMessages.length).toBeGreaterThan(0);
  });

  it('has region role with aria-label', () => {
    render(<StatusBoard workOrders={[]} />);
    expect(screen.getByRole('region', { name: 'Work order status board' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatusBoard workOrders={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
