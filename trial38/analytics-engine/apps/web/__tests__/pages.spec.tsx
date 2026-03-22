// TRACED: AE-TEST-07 - Frontend Page Tests
// TRACED: AE-TEST-08 - Test Configuration
import React from 'react';
import { render } from '@testing-library/react';
import { Nav } from '../components/nav';

// Mock next/dynamic to return a simple component
jest.mock('next/dynamic', () => {
  return function mockDynamic(loader: () => Promise<{ default: React.ComponentType }>) {
    return function DynamicComponent(props: Record<string, unknown>) {
      return <div data-testid="dynamic-component" {...props} />;
    };
  };
});

// Mock @analytics-engine/shared
jest.mock('@analytics-engine/shared', () => ({
  truncateText: (text: string, max: number) =>
    text.length > max ? text.slice(0, max - 3) + '...' : text,
  formatBytes: (bytes: number) => `${bytes} Bytes`,
  slugify: (input: string) =>
    input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
}));

describe('Nav Component', () => {
  it('renders the application name', () => {
    const { getByText } = render(<Nav />);
    expect(getByText('AE')).toBeTruthy();
  });

  it('renders navigation links', () => {
    const { getByText } = render(<Nav />);

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Dashboards')).toBeTruthy();
    expect(getByText('Pipelines')).toBeTruthy();
    expect(getByText('Reports')).toBeTruthy();
  });

  it('links point to correct routes', () => {
    const { getByText } = render(<Nav />);

    const homeLink = getByText('Home').closest('a');
    const dashboardsLink = getByText('Dashboards').closest('a');
    const pipelinesLink = getByText('Pipelines').closest('a');
    const reportsLink = getByText('Reports').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(dashboardsLink).toHaveAttribute('href', '/dashboards');
    expect(pipelinesLink).toHaveAttribute('href', '/pipelines');
    expect(reportsLink).toHaveAttribute('href', '/reports');
  });

  it('uses nav element for semantic HTML', () => {
    const { container } = render(<Nav />);
    const navElement = container.querySelector('nav');
    expect(navElement).toBeTruthy();
  });

  it('renders as accessible navigation landmark', () => {
    const { getByRole } = render(<Nav />);
    expect(getByRole('navigation')).toBeTruthy();
  });

  it('has aria-label for the navigation', () => {
    const { getByRole } = render(<Nav />);
    const nav = getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('contains all expected navigation items', () => {
    const { container } = render(<Nav />);
    const links = container.querySelectorAll('a');

    // Home + Dashboards + Pipelines + Reports
    expect(links.length).toBeGreaterThanOrEqual(4);
  });

  it('applies correct styling classes', () => {
    const { container } = render(<Nav />);
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav?.className).toBeTruthy();
  });

  it('renders list items for navigation links', () => {
    const { container } = render(<Nav />);
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(4);
  });
});

describe('Page Structure', () => {
  it('nav component can be rendered standalone', () => {
    const { container } = render(<Nav />);
    expect(container.firstChild).toBeTruthy();
  });

  it('nav renders without errors when no props provided', () => {
    expect(() => render(<Nav />)).not.toThrow();
  });

  it('nav accepts className prop', () => {
    const { container } = render(<Nav className="custom-class" />);
    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('custom-class');
  });
});
