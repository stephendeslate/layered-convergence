import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DisputeCard } from '@/components/disputes/dispute-card';

expect.extend(toHaveNoViolations);

const mockDispute = {
  id: 'dispute-1',
  transactionId: 'txn-1',
  transaction: {
    id: 'txn-1',
    title: 'Test Transaction',
    amount: '50.00',
    platformFee: '1.25',
    status: 'DISPUTED' as const,
    buyerId: 'b1',
    sellerId: 's1',
    buyer: { id: 'b1', email: 'b@test.com', name: 'Buyer', role: 'BUYER' as const, createdAt: '2024-01-01' },
    seller: { id: 's1', email: 's@test.com', name: 'Seller', role: 'SELLER' as const, createdAt: '2024-01-01' },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  filedById: 'b1',
  filedBy: { id: 'b1', email: 'b@test.com', name: 'Buyer', role: 'BUYER' as const, createdAt: '2024-01-01' },
  reason: 'Item not as described',
  createdAt: '2024-01-20T10:00:00Z',
  updatedAt: '2024-01-20T10:00:00Z',
};

describe('DisputeCard', () => {
  it('renders dispute reason', () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(screen.getByText('Item not as described')).toBeInTheDocument();
  });

  it('renders Open badge when unresolved', () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders Resolved badge when resolved', () => {
    const resolved = { ...mockDispute, resolution: 'Refund issued' };
    render(<DisputeCard dispute={resolved} />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders resolution text when present', () => {
    const resolved = { ...mockDispute, resolution: 'Refund issued' };
    render(<DisputeCard dispute={resolved} />);
    expect(screen.getByText('Refund issued')).toBeInTheDocument();
  });

  it('renders filed-by name', () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(screen.getByText('Buyer')).toBeInTheDocument();
  });

  it('links to dispute detail', () => {
    render(<DisputeCard dispute={mockDispute} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/disputes/dispute-1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DisputeCard dispute={mockDispute} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
