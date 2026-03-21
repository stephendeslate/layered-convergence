import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TransactionCard } from '@/components/transactions/transaction-card';

expect.extend(toHaveNoViolations);

const mockTransaction = {
  id: 'txn-1',
  title: 'Test Item',
  amount: '100.00',
  platformFee: '2.50',
  status: 'FUNDED' as const,
  buyerId: 'buyer-1',
  sellerId: 'seller-1',
  buyer: { id: 'buyer-1', email: 'b@test.com', name: 'Test Buyer', role: 'BUYER' as const, createdAt: '2024-01-01' },
  seller: { id: 'seller-1', email: 's@test.com', name: 'Test Seller', role: 'SELLER' as const, createdAt: '2024-01-01' },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

describe('TransactionCard', () => {
  it('renders transaction title', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('renders amount and fee', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$2.50')).toBeInTheDocument();
  });

  it('renders buyer and seller names', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    expect(screen.getByText('Test Buyer')).toBeInTheDocument();
    expect(screen.getByText('Test Seller')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    expect(screen.getByText('Funded')).toBeInTheDocument();
  });

  it('links to transaction detail', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    const link = screen.getByRole('link', { name: 'Test Item' });
    expect(link).toHaveAttribute('href', '/transactions/txn-1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TransactionCard transaction={mockTransaction} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
