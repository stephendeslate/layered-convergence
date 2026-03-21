// [TRACED:TS-004] Frontend component tests with jest-axe accessibility validation
import { render, screen } from '@testing-library/react';
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

describe('Nav', () => {
  it('renders nothing when user is null', () => {
    const { container } = render(<Nav user={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders navigation links when user is present', () => {
    render(<Nav user={mockUser} />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Work Orders')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Technicians')).toBeInTheDocument();
    expect(screen.getByText('Routes')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
  });

  it('displays user email', () => {
    render(<Nav user={mockUser} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('has a logout button', () => {
    render(<Nav user={mockUser} />);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(<Nav user={mockUser} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
