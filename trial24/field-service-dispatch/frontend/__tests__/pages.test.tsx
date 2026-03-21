// [TRACED:TS-005] Frontend page rendering tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders all entity cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Work Orders')).toBeInTheDocument();
    expect(screen.getByText('Technicians')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Routes')).toBeInTheDocument();
    expect(screen.getByText('GPS Events')).toBeInTheDocument();
  });

  it('renders navigation links to entity pages', () => {
    render(<DashboardPage />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/work-orders');
    expect(hrefs).toContain('/technicians');
    expect(hrefs).toContain('/customers');
    expect(hrefs).toContain('/invoices');
    expect(hrefs).toContain('/routes');
    expect(hrefs).toContain('/gps-events');
  });
});
