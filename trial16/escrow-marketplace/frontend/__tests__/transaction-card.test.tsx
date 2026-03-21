import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TransactionCard } from '@/components/transactions/transaction-card';
import type { Transaction } from '@/lib/types';

expect.extend(toHaveNoViolations);

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

const mockTransaction: Transaction = {
  id: 'txn-1',
  title: 'Test Transaction',
  description: 'A test transaction',
  amount: '150.00',
  platformFee: '3.75',
  status: 'FUNDED',
  buyerId: 'buyer-1',
  sellerId: 'seller-1',
  buyer: {
    id: 'buyer-1',
    email: 'buyer@test.com',
    name: 'Test Buyer',
    role: 'BUYER',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  seller: {
    id: 'seller-1',
    email: 'seller@test.com',
    name: 'Test Seller',
    role: 'SELLER',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

describe('TransactionCard', () => {
  it('should render transaction title', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    expect(screen.getByText('Test Transaction')).toBeInTheDocument();
  });

  it('should render formatted amount', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    expect(screen.getByText('FUNDED')).toBeInTheDocument();
  });

  it('should render buyer and seller names', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    expect(screen.getByText('Test Buyer')).toBeInTheDocument();
    expect(screen.getByText('Test Seller')).toBeInTheDocument();
  });

  it('should render description when present', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    expect(screen.getByText('A test transaction')).toBeInTheDocument();
  });

  it('should link to transaction detail page', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', '/transactions/txn-1');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TransactionCard transaction={mockTransaction} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
