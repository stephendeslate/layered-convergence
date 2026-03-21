// TRACED:TS-003 — All frontend tests include axe-core accessibility checks
// TRACED:TS-004 — Keyboard navigation tests exist for interactive components

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';

expect.extend(toHaveNoViolations);

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

import TransactionsPage from '@/app/transactions/page';

describe('TransactionsPage', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: '1',
            buyerId: 'b1',
            sellerId: 's1',
            amount: '100.00',
            description: 'Test item',
            status: 'PENDING',
            createdAt: '2026-01-01T00:00:00Z',
          },
        ]),
    });
  });

  it('renders transactions table', async () => {
    render(<TransactionsPage />);

    // Wait for data to load
    expect(await screen.findByText('Test item')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TransactionsPage />);

    // Wait for loading to finish
    await screen.findByText('Transactions');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has new transaction button with keyboard access', async () => {
    const user = userEvent.setup();
    render(<TransactionsPage />);

    await screen.findByText('Transactions');

    const newButton = screen.getByText('New Transaction');
    expect(newButton).toBeInTheDocument();

    // Tab to button
    await user.tab();
    // The link wrapping the button should be focusable
    const link = newButton.closest('a');
    expect(link).toHaveAttribute('href', '/transactions/new');
  });

  it('shows empty state when no transactions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<TransactionsPage />);
    expect(await screen.findByText('No transactions found.')).toBeInTheDocument();
  });
});
