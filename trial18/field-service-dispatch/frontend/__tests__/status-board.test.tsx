import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { StatusBoard } from '@/components/work-orders/status-board';
import type { WorkOrder } from '@/lib/types';

const mockWorkOrders: WorkOrder[] = [
  {
    id: '1',
    title: 'WO 1',
    description: 'Test',
    status: 'PENDING',
    priority: 1,
    scheduledAt: null,
    completedAt: null,
    customerId: 'c1',
    technicianId: null,
    companyId: 'co1',
    createdAt: '2026-03-21T10:00:00Z',
    updatedAt: '2026-03-21T10:00:00Z',
  },
  {
    id: '2',
    title: 'WO 2',
    description: 'Test 2',
    status: 'IN_PROGRESS',
    priority: 3,
    scheduledAt: null,
    completedAt: null,
    customerId: 'c1',
    technicianId: 't1',
    companyId: 'co1',
    createdAt: '2026-03-21T10:00:00Z',
    updatedAt: '2026-03-21T10:00:00Z',
  },
];

describe('StatusBoard', () => {
  it('should render counts for each status', () => {
    const { getByText } = render(<StatusBoard workOrders={mockWorkOrders} />);
    expect(getByText('PENDING')).toBeTruthy();
    expect(getByText('IN PROGRESS')).toBeTruthy();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<StatusBoard workOrders={mockWorkOrders} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
