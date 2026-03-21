import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Nav } from '@/components/nav';

describe('Nav', () => {
  it('renders the brand link', () => {
    render(<Nav />);
    expect(screen.getByText('Analytics Engine')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Nav />);
    expect(screen.getByText('Dashboards')).toBeInTheDocument();
    expect(screen.getByText('Data Sources')).toBeInTheDocument();
    expect(screen.getByText('Pipelines')).toBeInTheDocument();
    expect(screen.getByText('Widgets')).toBeInTheDocument();
    expect(screen.getByText('Embeds')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('has an accessible navigation landmark', () => {
    render(<Nav />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
