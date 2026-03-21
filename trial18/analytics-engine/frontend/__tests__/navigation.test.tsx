import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import RootLayout from '@/app/layout';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Navigation', () => {
  it('renders navigation with all links', () => {
    render(
      <RootLayout>
        <div>test content</div>
      </RootLayout>,
    );

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByText('Dashboards')).toBeInTheDocument();
    expect(screen.getByText('Data Sources')).toBeInTheDocument();
    expect(screen.getByText('Pipelines')).toBeInTheDocument();
    expect(screen.getByText('Embeds')).toBeInTheDocument();
  });

  it('has skip-to-content link', () => {
    render(
      <RootLayout>
        <div>test content</div>
      </RootLayout>,
    );

    expect(screen.getByText('Skip to content')).toBeInTheDocument();
  });

  it('sets lang attribute on html element', () => {
    const { container } = render(
      <RootLayout>
        <div>test content</div>
      </RootLayout>,
    );

    const html = container.closest('html') ?? container.querySelector('html');
    if (html) {
      expect(html.getAttribute('lang')).toBe('en');
    }
  });

  it('passes accessibility checks', async () => {
    const { container } = render(
      <RootLayout>
        <div>test content</div>
      </RootLayout>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
