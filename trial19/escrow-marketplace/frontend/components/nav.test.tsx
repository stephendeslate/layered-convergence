import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Nav } from './nav';

expect.extend(toHaveNoViolations);

vi.mock('@/lib/actions', () => ({
  logoutAction: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    <a href={href} {...props}>{children}</a>,
}));

describe('Nav', () => {
  it('should render navigation links', () => {
    render(<Nav />);

    expect(screen.getByText('Escrow Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Disputes')).toBeInTheDocument();
    expect(screen.getByText('Payouts')).toBeInTheDocument();
  });

  it('should have aria-label on nav element', () => {
    render(<Nav />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('should render logout button', () => {
    render(<Nav />);

    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const links = screen.getAllByRole('link');
    await user.tab();

    for (const _link of links) {
      const focused = document.activeElement;
      expect(focused?.tagName).toBe('A');
      await user.tab();
    }
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
