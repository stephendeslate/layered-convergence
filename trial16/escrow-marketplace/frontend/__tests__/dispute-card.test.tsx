import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DisputeCard } from '@/components/disputes/dispute-card';
import type { Dispute } from '@/lib/types';

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

const mockDispute: Dispute = {
  id: 'dispute-1',
  transactionId: 'txn-1',
  transaction: {
    id: 'txn-1',
    title: 'Disputed Transaction',
    description: null,
    amount: '200.00',
    platformFee: '5.00',
    status: 'DISPUTED',
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
  },
  filedById: 'buyer-1',
  filedBy: {
    id: 'buyer-1',
    email: 'buyer@test.com',
    name: 'Test Buyer',
    role: 'BUYER',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  reason: 'Item was not as described in the listing',
  evidence: 'Screenshots of the original listing',
  resolution: null,
  createdAt: '2024-01-20T14:00:00Z',
  updatedAt: '2024-01-20T14:00:00Z',
};

describe('DisputeCard', () => {
  it('should render dispute transaction title', () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(
      screen.getByText(/disputed transaction/i),
    ).toBeInTheDocument();
  });

  it('should render transaction status', () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(screen.getByText('DISPUTED')).toBeInTheDocument();
  });

  it('should render filer name', () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(screen.getByText('Test Buyer')).toBeInTheDocument();
  });

  it('should render dispute reason', () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(
      screen.getByText('Item was not as described in the listing'),
    ).toBeInTheDocument();
  });

  it('should render evidence when present', () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(
      screen.getByText('Screenshots of the original listing'),
    ).toBeInTheDocument();
  });

  it('should link to dispute detail page', () => {
    render(<DisputeCard dispute={mockDispute} />);
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', '/disputes/dispute-1');
  });

  it('should not render resolution when null', () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(screen.queryByText('Resolution')).not.toBeInTheDocument();
  });

  it('should render resolution when present', () => {
    const resolvedDispute: Dispute = {
      ...mockDispute,
      transaction: { ...mockDispute.transaction, status: 'RESOLVED' },
      resolution: 'Funds released to seller',
    };
    render(<DisputeCard dispute={resolvedDispute} />);
    expect(screen.getByText('Funds released to seller')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<DisputeCard dispute={mockDispute} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
