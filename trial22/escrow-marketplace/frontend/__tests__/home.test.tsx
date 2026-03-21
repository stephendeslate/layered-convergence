// TRACED:TS-003 — All frontend tests include axe-core accessibility checks
// TRACED:TS-004 — Keyboard navigation tests exist for interactive components

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';

expect.extend(toHaveNoViolations);

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders heading and description', () => {
    render(<HomePage />);

    expect(screen.getByText('Escrow Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Secure Escrow')).toBeInTheDocument();
    expect(screen.getByText('Dispute Resolution')).toBeInTheDocument();
    expect(screen.getByText('Transparent Tracking')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has links to register and login', () => {
    render(<HomePage />);

    const getStartedLink = screen.getByText('Get Started').closest('a');
    expect(getStartedLink).toHaveAttribute('href', '/register');

    const signInLink = screen.getByText('Sign In').closest('a');
    expect(signInLink).toHaveAttribute('href', '/login');
  });

  it('supports keyboard navigation to CTA buttons', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // Tab through to find focusable CTA links
    await user.tab();
    const focused = document.activeElement;
    expect(focused?.tagName).toBe('A');
  });
});
