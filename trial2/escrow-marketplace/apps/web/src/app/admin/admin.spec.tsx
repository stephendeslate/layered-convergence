import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

const mockApiFetch = vi.fn();
vi.mock('../../lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
  getStoredToken: vi.fn(() => 'admin-token'),
  getStoredUser: vi.fn(() => ({ id: '1', email: 'admin@demo.com', name: 'Admin', role: 'ADMIN' })),
  clearStoredAuth: vi.fn(),
}));

import AdminDashboard from './page';

const mockAnalytics = {
  totalTransactions: 42,
  totalVolume: 100000,
  totalFees: 10000,
  disputeRate: 2.5,
  transactionsByStatus: [
    { status: 'CREATED', count: 5 },
    { status: 'HELD', count: 10 },
    { status: 'RELEASED', count: 25 },
    { status: 'DISPUTED', count: 2 },
  ],
};

const mockVolume = {
  data: [
    { date: '2024-01-01', count: 3, volume: 5000, fees: 500 },
    { date: '2024-01-02', count: 5, volume: 8000, fees: 800 },
  ],
};

const mockDisputes = {
  data: [
    {
      id: 'd1',
      status: 'OPEN',
      reason: 'SERVICE_NOT_DELIVERED',
      description: 'Never received the work',
      createdAt: '2024-01-15T00:00:00Z',
      transaction: { id: 't1', amount: 5000, buyer: { name: 'Buyer1' }, provider: { name: 'Provider1' } },
      raisedBy: { name: 'Buyer1' },
    },
  ],
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockImplementation((path: string) => {
      if (path.includes('overview')) return Promise.resolve(mockAnalytics);
      if (path.includes('volume')) return Promise.resolve(mockVolume);
      if (path.includes('disputes')) return Promise.resolve(mockDisputes);
      return Promise.resolve({});
    });
  });

  it('renders analytics overview', async () => {
    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('$1000.00')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
      expect(screen.getByText('2.5%')).toBeInTheDocument();
    });
  });

  it('renders transaction status breakdown', async () => {
    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('CREATED: 5')).toBeInTheDocument();
      expect(screen.getByText('HELD: 10')).toBeInTheDocument();
      expect(screen.getByText('RELEASED: 25')).toBeInTheDocument();
    });
  });

  it('switches to dispute queue tab', async () => {
    render(<AdminDashboard />);
    await waitFor(() => expect(screen.getByText('42')).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Dispute Queue/));
    expect(screen.getByText(/SERVICE NOT DELIVERED/)).toBeInTheDocument();
    expect(screen.getByText('Never received the work')).toBeInTheDocument();
    expect(screen.getByText(/Resolve for Buyer/)).toBeInTheDocument();
    expect(screen.getByText(/Resolve for Provider/)).toBeInTheDocument();
  });

  it('resolves dispute', async () => {
    render(<AdminDashboard />);
    await waitFor(() => expect(screen.getByText('42')).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Dispute Queue/));
    fireEvent.click(screen.getByText(/Resolve for Buyer/));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/disputes/d1/resolve',
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({ resolution: 'BUYER' }),
        }),
      );
    });
  });
});
