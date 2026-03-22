// Page rendering tests
import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('Page rendering', () => {
  it('should render home page stats', async () => {
    const HomePage = (await import('../app/page')).default;
    render(<HomePage />);
    expect(screen.getByText('Field Service Dispatch')).toBeDefined();
    expect(screen.getByText('Active Work Orders')).toBeDefined();
  });

  it('should render work orders page with table', async () => {
    const WorkOrdersPage = (await import('../app/work-orders/page')).default;
    render(<WorkOrdersPage />);
    expect(screen.getByText('Work Orders')).toBeDefined();
    expect(screen.getByText('HVAC Repair')).toBeDefined();
  });

  it('should render technicians page with cards', async () => {
    const TechniciansPage = (await import('../app/technicians/page')).default;
    render(<TechniciansPage />);
    expect(screen.getByText('Technicians')).toBeDefined();
    expect(screen.getByText('Alice Johnson')).toBeDefined();
  });

  it('should render schedule page with table', async () => {
    const SchedulePage = (await import('../app/schedule/page')).default;
    render(<SchedulePage />);
    expect(screen.getByText('Schedule')).toBeDefined();
    expect(screen.getByText('Upcoming Assignments')).toBeDefined();
  });
});
