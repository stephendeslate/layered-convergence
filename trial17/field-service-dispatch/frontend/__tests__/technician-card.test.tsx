import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TechnicianCard } from '@/components/technicians/technician-card';
import type { Technician } from '@/lib/types';

expect.extend(toHaveNoViolations);

const mockTechnician: Technician = {
  id: 'tech-1',
  email: 'tech@example.com',
  name: 'John Doe',
  phone: '555-1234',
  skills: ['HVAC', 'Plumbing'],
  availability: 'AVAILABLE',
  latitude: null,
  longitude: null,
  companyId: 'company-1',
  workOrders: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('TechnicianCard', () => {
  it('renders technician name', () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders email', () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText('tech@example.com')).toBeInTheDocument();
  });

  it('renders phone when present', () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText('555-1234')).toBeInTheDocument();
  });

  it('renders skills', () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText('HVAC, Plumbing')).toBeInTheDocument();
  });

  it('renders availability badge', () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByLabelText('Availability: Available')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TechnicianCard technician={mockTechnician} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
