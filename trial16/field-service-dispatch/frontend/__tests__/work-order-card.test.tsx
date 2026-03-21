import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { WorkOrderCard } from '@/components/work-orders/work-order-card';
import type { WorkOrder } from '@/lib/types';

expect.extend(toHaveNoViolations);

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockWorkOrder: WorkOrder = {
  id: 'wo-1',
  title: 'Fix AC Unit',
  description: 'The air conditioning unit on the second floor is not cooling.',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  scheduledAt: null,
  completedAt: null,
  customerId: 'cu-1',
  customer: {
    id: 'cu-1',
    name: 'Acme Corp',
    email: 'acme@example.com',
    phone: '555-1234',
    address: '123 Main St',
    latitude: 40.7128,
    longitude: -74.006,
    companyId: 'c-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  technicianId: 't-1',
  technician: {
    id: 't-1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '555-5678',
    skills: ['HVAC'],
    availability: 'AVAILABLE',
    latitude: null,
    longitude: null,
    companyId: 'c-1',
    workOrders: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  companyId: 'c-1',
  invoices: [],
  createdAt: '2026-03-20T10:00:00Z',
  updatedAt: '2026-03-20T10:00:00Z',
};

describe('WorkOrderCard', () => {
  it('should render work order title', () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText('Fix AC Unit')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should render customer name', () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
  });

  it('should render technician name', () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText(/air conditioning/i)).toBeInTheDocument();
  });

  it('should link to work order detail page', () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/work-orders/wo-1');
  });

  it('should show Unassigned when no customer', () => {
    const wo = { ...mockWorkOrder, customer: undefined as any };
    render(<WorkOrderCard workOrder={wo} />);
    expect(screen.getByText(/Unassigned/)).toBeInTheDocument();
  });

  it('should not show technician line when no technician', () => {
    const wo = { ...mockWorkOrder, technician: null, technicianId: null };
    render(<WorkOrderCard workOrder={wo} />);
    expect(screen.queryByText(/Technician:/)).not.toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<WorkOrderCard workOrder={mockWorkOrder} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
