import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Nav } from '@/components/nav';

describe('Nav', () => {
  it('renders navigation with aria-label', () => {
    render(<Nav />);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('renders main navigation links', () => {
    render(<Nav />);
    expect(screen.getByText('Dashboards')).toBeInTheDocument();
    expect(screen.getByText('Data Sources')).toBeInTheDocument();
    expect(screen.getByText('Pipelines')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
