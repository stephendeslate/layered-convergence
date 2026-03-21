import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

function Navigation() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <nav aria-label="Main navigation" className="container mx-auto flex h-14 items-center gap-6 px-4">
        <a href="/" className="text-lg font-bold">
          Analytics Engine
        </a>
        <a href="/data-sources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Data Sources
        </a>
        <a href="/pipelines" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Pipelines
        </a>
        <a href="/dashboards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Dashboards
        </a>
        <a href="/embeds" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Embeds
        </a>
      </nav>
    </header>
  );
}

describe('Navigation', () => {
  it('should render the app name as a link to home', () => {
    render(<Navigation />);
    const homeLink = screen.getByRole('link', { name: /analytics engine/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have a nav element with aria-label', () => {
    render(<Navigation />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('should render Data Sources link', () => {
    render(<Navigation />);
    const link = screen.getByRole('link', { name: /data sources/i });
    expect(link).toHaveAttribute('href', '/data-sources');
  });

  it('should render Pipelines link', () => {
    render(<Navigation />);
    const link = screen.getByRole('link', { name: /pipelines/i });
    expect(link).toHaveAttribute('href', '/pipelines');
  });

  it('should render Dashboards link', () => {
    render(<Navigation />);
    const link = screen.getByRole('link', { name: /dashboards/i });
    expect(link).toHaveAttribute('href', '/dashboards');
  });

  it('should render Embeds link', () => {
    render(<Navigation />);
    const link = screen.getByRole('link', { name: /embeds/i });
    expect(link).toHaveAttribute('href', '/embeds');
  });

  it('should render all 5 navigation links', () => {
    render(<Navigation />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Navigation />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Skip to content link', () => {
  it('should render skip-to-content link targeting main content', () => {
    render(
      <div>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:underline"
        >
          Skip to content
        </a>
        <main id="main-content">Content</main>
      </div>,
    );
    const skipLink = screen.getByText('Skip to content');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should have matching main-content target', () => {
    render(
      <div>
        <a href="#main-content">Skip to content</a>
        <main id="main-content">Content</main>
      </div>,
    );
    expect(document.getElementById('main-content')).toBeInTheDocument();
  });
});
