import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { TechnicianCard } from '@/components/technicians/technician-card';
import type { Technician } from '@/lib/types';

const mockTechnician: Technician = {
  id: 'tech-1',
  name: 'Jane Smith',
  email: 'jane@test.com',
  phone: '555-1234',
  specialties: ['HVAC', 'Plumbing'],
  available: true,
  companyId: 'co1',
};

describe('TechnicianCard', () => {
  it('should render technician name and details', () => {
    const { getByText } = render(<TechnicianCard technician={mockTechnician} />);
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(getByText('jane@test.com')).toBeTruthy();
    expect(getByText('HVAC')).toBeTruthy();
    expect(getByText('Plumbing')).toBeTruthy();
  });

  it('should link to technician detail page', () => {
    const { container } = render(<TechnicianCard technician={mockTechnician} />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/technicians/tech-1');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<TechnicianCard technician={mockTechnician} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
