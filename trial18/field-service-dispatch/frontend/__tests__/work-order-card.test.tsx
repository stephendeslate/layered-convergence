import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { WorkOrderCard } from '@/components/work-orders/work-order-card';
import type { WorkOrder } from '@/lib/types';

const mockWorkOrder: WorkOrder = {
  id: 'wo-1',
  title: 'Fix AC Unit',
  description: 'AC unit not cooling',
  status: 'PENDING',
  priority: 3,
  scheduledAt: null,
  completedAt: null,
  customerId: 'c1',
  technicianId: null,
  companyId: 'co1',
  createdAt: '2026-03-21T10:00:00Z',
  updatedAt: '2026-03-21T10:00:00Z',
  customer: { id: 'c1', name: 'Acme Corp', email: 'acme@test.com', phone: '555', address: '1 Main St', companyId: 'co1' },
};

describe('WorkOrderCard', () => {
  it('should render work order title and status', () => {
    const { getByText } = render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(getByText('Fix AC Unit')).toBeTruthy();
    expect(getByText('PENDING')).toBeTruthy();
  });

  it('should link to work order detail page', () => {
    const { container } = render(<WorkOrderCard workOrder={mockWorkOrder} />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/work-orders/wo-1');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<WorkOrderCard workOrder={mockWorkOrder} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
