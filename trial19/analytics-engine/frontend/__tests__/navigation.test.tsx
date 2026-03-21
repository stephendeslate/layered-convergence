import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { Nav } from '@/components/nav';

describe('Nav', () => {
  it('renders navigation with aria-label', () => {
    render(<Nav />);

    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('contains links to all main sections', () => {
    render(<Nav />);

    const nav = screen.getByRole('navigation');
    const links = within(nav).getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/dashboards');
    expect(hrefs).toContain('/data-sources');
    expect(hrefs).toContain('/pipelines');
  });

  it('has login and register links', () => {
    render(<Nav />);

    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('keyboard navigable links have correct order', () => {
    render(<Nav />);

    const nav = screen.getByRole('navigation');
    const links = within(nav).getAllByRole('link');

    expect(links.length).toBeGreaterThanOrEqual(5);
    expect(links[0]).toHaveTextContent('Analytics Engine');
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
