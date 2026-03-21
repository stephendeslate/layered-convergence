import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionTimeline from './TransactionTimeline';

const mockHistory = [
  {
    id: '1',
    fromState: 'CREATED',
    toState: 'CREATED',
    reason: null,
    performedBy: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    fromState: 'CREATED',
    toState: 'HELD',
    reason: 'Payment confirmed',
    performedBy: 'system',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    fromState: 'HELD',
    toState: 'RELEASED',
    reason: 'Buyer confirmed delivery',
    performedBy: 'user-123',
    createdAt: '2024-01-03T00:00:00Z',
  },
];

describe('TransactionTimeline', () => {
  it('renders all history entries', () => {
    render(<TransactionTimeline history={mockHistory} />);
    expect(screen.getByText('CREATED')).toBeInTheDocument();
    expect(screen.getByText(/CREATED.*HELD/)).toBeInTheDocument();
    expect(screen.getByText(/HELD.*RELEASED/)).toBeInTheDocument();
  });

  it('displays transition reasons', () => {
    render(<TransactionTimeline history={mockHistory} />);
    expect(screen.getByText('Payment confirmed')).toBeInTheDocument();
    expect(screen.getByText('Buyer confirmed delivery')).toBeInTheDocument();
  });

  it('shows performer for non-system entries', () => {
    render(<TransactionTimeline history={mockHistory} />);
    expect(screen.getByText(/by user-123/)).toBeInTheDocument();
  });

  it('renders empty for no history', () => {
    const { container } = render(<TransactionTimeline history={[]} />);
    const children = container.firstElementChild?.children;
    expect(children?.length).toBe(1);
  });
});
