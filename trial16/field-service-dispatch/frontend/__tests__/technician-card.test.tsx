import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TechnicianCard } from '@/components/technicians/technician-card';
import type { Technician } from '@/lib/types';

expect.extend(toHaveNoViolations);

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockTechnician: Technician = {
  id: 't-1',
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '555-9876',
  skills: ['HVAC', 'Plumbing', 'Electrical'],
  availability: 'AVAILABLE',
  latitude: 40.7128,
  longitude: -74.006,
  companyId: 'c-1',
  workOrders: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('TechnicianCard', () => {
  it('should render technician name', () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should render email and phone', () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('555-9876')).toBeInTheDocument();
  });

  it('should render skills', () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText('HVAC')).toBeInTheDocument();
    expect(screen.getByText('Plumbing')).toBeInTheDocument();
    expect(screen.getByText('Electrical')).toBeInTheDocument();
  });

  it('should render availability badge', () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should link to technician detail page', () => {
    render(<TechnicianCard technician={mockTechnician} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/technicians/t-1');
  });

  it('should not render skills section when empty', () => {
    const tech = { ...mockTechnician, skills: [] };
    render(<TechnicianCard technician={tech} />);
    expect(screen.queryByText('HVAC')).not.toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<TechnicianCard technician={mockTechnician} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
