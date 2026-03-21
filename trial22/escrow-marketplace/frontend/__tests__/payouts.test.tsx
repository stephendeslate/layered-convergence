// TRACED:TS-003 — All frontend tests include axe-core accessibility checks
// TRACED:TS-004 — Keyboard navigation tests exist for interactive components

import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';

expect.extend(toHaveNoViolations);

const mockFetch = vi.fn();
global.fetch = mockFetch;

import PayoutsPage from '@/app/payouts/page';

describe('PayoutsPage', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 'p1',
            transactionId: 't1',
            recipientId: 'r1',
            amount: '250.00',
            paidAt: '2026-03-01T00:00:00Z',
          },
        ]),
    });
  });

  it('renders payouts table', async () => {
    render(<PayoutsPage />);

    expect(await screen.findByText('$250.00')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PayoutsPage />);

    await screen.findByText('Payouts');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows empty state when no payouts', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<PayoutsPage />);
    expect(await screen.findByText('No payouts found.')).toBeInTheDocument();
  });
});
