import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StatusBadge } from '@/components/transactions/status-badge';

expect.extend(toHaveNoViolations);

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders different statuses', () => {
    const { rerender } = render(<StatusBadge status="FUNDED" />);
    expect(screen.getByText('Funded')).toBeInTheDocument();

    rerender(<StatusBadge status="RELEASED" />);
    expect(screen.getByText('Released')).toBeInTheDocument();

    rerender(<StatusBadge status="DISPUTED" />);
    expect(screen.getByText('Disputed')).toBeInTheDocument();
  });

  it('includes a color dot with aria-hidden', () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
  });

  it('provides text alternative alongside color dot', () => {
    render(<StatusBadge status="CANCELLED" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
