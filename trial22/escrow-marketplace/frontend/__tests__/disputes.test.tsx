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

const mockFetch = vi.fn();
global.fetch = mockFetch;

import DisputesPage from '@/app/disputes/page';

describe('DisputesPage', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 'd1',
            transactionId: 't1',
            reason: 'Item damaged',
            status: 'OPEN',
            createdAt: '2026-02-15T00:00:00Z',
          },
        ]),
    });
  });

  it('renders disputes table', async () => {
    render(<DisputesPage />);

    expect(await screen.findByText('Item damaged')).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DisputesPage />);

    await screen.findByText('Disputes');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation to view buttons', async () => {
    const user = userEvent.setup();
    render(<DisputesPage />);

    await screen.findByText('Item damaged');

    const viewButton = screen.getByText('View');
    expect(viewButton).toBeInTheDocument();

    const link = viewButton.closest('a');
    expect(link).toHaveAttribute('href', '/disputes/d1');
  });

  it('shows empty state when no disputes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<DisputesPage />);
    expect(await screen.findByText('No disputes found.')).toBeInTheDocument();
  });
});
