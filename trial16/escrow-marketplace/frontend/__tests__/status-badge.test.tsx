import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StatusBadge } from '@/components/transactions/status-badge';
import type { TransactionStatus } from '@/lib/types';

expect.extend(toHaveNoViolations);

describe('StatusBadge', () => {
  const statuses: TransactionStatus[] = [
    'PENDING',
    'FUNDED',
    'SHIPPED',
    'DELIVERED',
    'RELEASED',
    'CANCELLED',
    'DISPUTED',
    'RESOLVED',
    'REFUNDED',
  ];

  it.each(statuses)('should render %s status', (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });

  it('should apply correct color classes for PENDING', () => {
    render(<StatusBadge status="PENDING" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge.className).toContain('bg-yellow-100');
    expect(badge.className).toContain('text-yellow-800');
  });

  it('should apply correct color classes for FUNDED', () => {
    render(<StatusBadge status="FUNDED" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-800');
  });

  it('should apply correct color classes for DISPUTED', () => {
    render(<StatusBadge status="DISPUTED" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge.className).toContain('bg-red-100');
    expect(badge.className).toContain('text-red-800');
  });

  it('should apply correct color classes for RELEASED', () => {
    render(<StatusBadge status="RELEASED" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('should accept custom className', () => {
    render(<StatusBadge status="PENDING" className="custom-class" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge.className).toContain('custom-class');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
