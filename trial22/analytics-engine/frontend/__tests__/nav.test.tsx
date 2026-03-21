// [TRACED:TS-005] Nav component tests with axe-core accessibility checks

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Nav } from '../components/nav';

expect.extend(toHaveNoViolations);

describe('Nav', () => {
  it('renders navigation links', () => {
    render(<Nav />);

    expect(screen.getByText('Analytics Engine')).toBeDefined();
    expect(screen.getByText('Dashboards')).toBeDefined();
    expect(screen.getByText('Data Sources')).toBeDefined();
    expect(screen.getByText('Pipelines')).toBeDefined();
    expect(screen.getByText('Login')).toBeDefined();
  });

  it('has an accessible navigation landmark', () => {
    render(<Nav />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeDefined();
    expect(nav.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
