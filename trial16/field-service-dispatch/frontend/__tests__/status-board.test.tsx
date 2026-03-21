import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StatusBoard } from '@/components/work-orders/status-board';
import type { WorkOrder } from '@/lib/types';

expect.extend(toHaveNoViolations);

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const makeWorkOrder = (id: string, status: string): WorkOrder => ({
  id,
  title: `Work Order ${id}`,
  description: 'Test description',
  status: status as WorkOrder['status'],
  priority: 'MEDIUM',
  scheduledAt: null,
  completedAt: null,
  customerId: 'cu-1',
  customer: {
    id: 'cu-1',
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '555-1234',
    address: '123 Main St',
    latitude: 40.7128,
    longitude: -74.006,
    companyId: 'c-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  technicianId: null,
  technician: null,
  companyId: 'c-1',
  invoices: [],
  createdAt: '2026-03-20T10:00:00Z',
  updatedAt: '2026-03-20T10:00:00Z',
});

describe('StatusBoard', () => {
  it('should render column headers for each status', () => {
    render(<StatusBoard workOrders={[]} />);

    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should render En Route column', () => {
    render(<StatusBoard workOrders={[]} />);
    expect(screen.getByText('En Route')).toBeInTheDocument();
  });

  it('should render On Hold column', () => {
    render(<StatusBoard workOrders={[]} />);
    expect(screen.getByText('On Hold')).toBeInTheDocument();
  });

  it('should render Completed column', () => {
    render(<StatusBoard workOrders={[]} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render work orders in correct columns', () => {
    const workOrders = [
      makeWorkOrder('wo-1', 'CREATED'),
      makeWorkOrder('wo-2', 'IN_PROGRESS'),
    ];

    render(<StatusBoard workOrders={workOrders} />);

    expect(screen.getByText('Work Order wo-1')).toBeInTheDocument();
    expect(screen.getByText('Work Order wo-2')).toBeInTheDocument();
  });

  it('should show counts for each column', () => {
    const workOrders = [
      makeWorkOrder('wo-1', 'CREATED'),
      makeWorkOrder('wo-2', 'CREATED'),
    ];

    render(<StatusBoard workOrders={workOrders} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should show empty state for columns with no work orders', () => {
    render(<StatusBoard workOrders={[]} />);

    const emptyMessages = screen.getAllByText('No work orders');
    expect(emptyMessages.length).toBeGreaterThan(0);
  });

  it('should have no accessibility violations', async () => {
    const workOrders = [makeWorkOrder('wo-1', 'CREATED')];
    const { container } = render(<StatusBoard workOrders={workOrders} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when empty', async () => {
    const { container } = render(<StatusBoard workOrders={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
