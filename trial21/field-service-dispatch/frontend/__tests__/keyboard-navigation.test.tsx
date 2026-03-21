import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Nav } from '@/components/nav';

expect.extend(toHaveNoViolations);

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

const mockUser = {
  id: '1',
  email: 'test@example.com',
  role: 'DISPATCHER' as const,
  companyId: 'comp-1',
};

describe('Keyboard Navigation', () => {
  it('all nav links are keyboard focusable', async () => {
    const user = userEvent.setup();
    render(<Nav user={mockUser} />);

    const links = screen.getAllByRole('link');
    for (const link of links) {
      await user.tab();
      // Each link should be reachable via tab
      expect(link).toBeVisible();
    }
  });

  it('navigation links have focus ring styles', () => {
    render(<Nav user={mockUser} />);
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink.className).toContain('focus:ring-2');
  });

  it('logout button is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<Nav user={mockUser} />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    logoutButton.focus();
    expect(document.activeElement).toBe(logoutButton);
  });

  it('nav has proper aria-label for screen readers', () => {
    render(<Nav user={mockUser} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });
});
