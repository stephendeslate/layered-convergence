// TRACED:TS-003 — All frontend tests include axe-core accessibility checks
// TRACED:TS-004 — Keyboard navigation tests exist for interactive components

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import { Nav } from '@/components/nav';

expect.extend(toHaveNoViolations);

// Mock next/link to render as <a>
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Nav', () => {
  it('renders navigation links', () => {
    render(<Nav />);

    expect(screen.getByText('Escrow Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Disputes')).toBeInTheDocument();
    expect(screen.getByText('Payouts')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation between links', async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(5);

    // Tab through navigation links
    await user.tab();
    expect(links[0]).toHaveFocus();

    await user.tab();
    expect(links[1]).toHaveFocus();

    await user.tab();
    expect(links[2]).toHaveFocus();
  });

  it('has proper aria-label on nav element', () => {
    render(<Nav />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });
});
