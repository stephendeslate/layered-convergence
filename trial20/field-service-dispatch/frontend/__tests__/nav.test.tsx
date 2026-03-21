import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

interface User {
  id: string;
  email: string;
  role: string;
  companyId: string;
}

function Nav({ user }: { user: User | null }) {
  if (!user) return null;

  return (
    <nav aria-label="Main navigation" className="border-b">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="text-lg font-semibold">Field Service Dispatch</a>
          <div className="flex items-center gap-4">
            <a href="/dashboard">Dashboard</a>
            <a href="/work-orders">Work Orders</a>
            <a href="/customers">Customers</a>
            <a href="/technicians">Technicians</a>
            <a href="/routes">Routes</a>
            <a href="/invoices">Invoices</a>
          </div>
        </div>
        <span>{user.email}</span>
      </div>
    </nav>
  );
}

describe('Nav', () => {
  const mockUser: User = {
    id: '1',
    email: 'dispatcher@test.com',
    role: 'DISPATCHER',
    companyId: 'c1',
  };

  it('renders nothing when user is null', () => {
    const { container } = render(<Nav user={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders navigation links when user is authenticated', () => {
    render(<Nav user={mockUser} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Work Orders')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Technicians')).toBeInTheDocument();
    expect(screen.getByText('Routes')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
  });

  it('displays user email', () => {
    render(<Nav user={mockUser} />);
    expect(screen.getByText('dispatcher@test.com')).toBeInTheDocument();
  });

  it('has aria-label for main navigation', () => {
    render(<Nav user={mockUser} />);
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Nav user={mockUser} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
