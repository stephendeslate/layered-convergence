import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StatusBoard } from '@/components/status-board';
import type { WorkOrder } from '@/lib/types';

expect.extend(toHaveNoViolations);

const mockWorkOrders: WorkOrder[] = [
  {
    id: '1',
    title: 'Fix AC',
    description: 'Air conditioning broken',
    status: 'PENDING',
    priority: 1,
    scheduledAt: null,
    completedAt: null,
    customerId: 'c1',
    technicianId: null,
    companyId: 'co1',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    customer: { id: 'c1', name: 'John Doe', email: 'j@t.com', phone: '555', address: '1 St', companyId: 'co1' },
  },
  {
    id: '2',
    title: 'Repair Heater',
    description: 'Heater not working',
    status: 'IN_PROGRESS',
    priority: 3,
    scheduledAt: null,
    completedAt: null,
    customerId: 'c2',
    technicianId: 't1',
    companyId: 'co1',
    createdAt: '2026-01-02',
    updatedAt: '2026-01-02',
  },
];

describe('StatusBoard', () => {
  it('should render work orders grouped by status', () => {
    render(<StatusBoard workOrders={mockWorkOrders} />);
    expect(screen.getByText('Fix AC')).toBeInTheDocument();
    expect(screen.getByText('Repair Heater')).toBeInTheDocument();
  });

  it('should show status badges', () => {
    render(<StatusBoard workOrders={mockWorkOrders} />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  it('should show customer name when available', () => {
    render(<StatusBoard workOrders={mockWorkOrders} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<StatusBoard workOrders={mockWorkOrders} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
