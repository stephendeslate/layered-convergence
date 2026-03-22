// TRACED: FD-TEST-UI-003 — Page rendering tests for all routes
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock next/link for testing
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/dynamic for testing
jest.mock('next/dynamic', () => {
  return function mockDynamic(loader: () => Promise<{ default: React.ComponentType }>) {
    const LazyComponent = React.lazy(loader);
    return function DynamicComponent(props: Record<string, unknown>) {
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent {...props} />
        </React.Suspense>
      );
    };
  };
});

import HomePage from '../app/page';
import WorkOrdersPage from '../app/work-orders/page';
import TechniciansPage from '../app/technicians/page';
import RootLoading from '../app/loading';
import WorkOrdersLoading from '../app/work-orders/loading';
import TechniciansLoading from '../app/technicians/loading';
import ScheduleLoading from '../app/schedule/loading';
import { Nav } from '../components/nav';

describe('Page Rendering', () => {
  describe('HomePage', () => {
    it('renders the page heading', () => {
      render(<HomePage />);
      expect(screen.getByText('Field Service Dispatch')).toBeInTheDocument();
    });

    it('renders stat cards', () => {
      render(<HomePage />);
      expect(screen.getByText('Active Work Orders')).toBeInTheDocument();
      expect(screen.getByText('287')).toBeInTheDocument();
      expect(screen.getByText('Technicians On Duty')).toBeInTheDocument();
    });

    it('renders the latest work order section', () => {
      render(<HomePage />);
      expect(screen.getByText('Latest Work Order')).toBeInTheDocument();
    });

    it('renders formatted bytes value', () => {
      render(<HomePage />);
      expect(screen.getByText('4 GB')).toBeInTheDocument();
    });
  });

  describe('WorkOrdersPage', () => {
    it('renders the page heading', () => {
      render(<WorkOrdersPage />);
      expect(screen.getByText('Work Orders')).toBeInTheDocument();
    });

    it('renders work order table headers', () => {
      render(<WorkOrdersPage />);
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Assignee')).toBeInTheDocument();
    });

    it('renders work order count badge', () => {
      render(<WorkOrdersPage />);
      expect(screen.getByText('5 total')).toBeInTheDocument();
    });

    it('renders status badges for all statuses', () => {
      render(<WorkOrdersPage />);
      expect(screen.getByText('OPEN')).toBeInTheDocument();
      expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('FAILED')).toBeInTheDocument();
      expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    });
  });

  describe('TechniciansPage', () => {
    it('renders the page heading', () => {
      render(<TechniciansPage />);
      expect(screen.getByText('Technicians')).toBeInTheDocument();
    });

    it('renders technician names', () => {
      render(<TechniciansPage />);
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
      expect(screen.getByText('James Chen')).toBeInTheDocument();
    });

    it('renders specialty column', () => {
      render(<TechniciansPage />);
      expect(screen.getByText('HVAC')).toBeInTheDocument();
      expect(screen.getByText('Electrical')).toBeInTheDocument();
    });

    it('renders technician count badge', () => {
      render(<TechniciansPage />);
      expect(screen.getByText('4 total')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders all navigation links', () => {
      render(<Nav />);
      expect(screen.getByText('Work Orders')).toBeInTheDocument();
      expect(screen.getByText('Technicians')).toBeInTheDocument();
      expect(screen.getByText('Schedule')).toBeInTheDocument();
    });

    it('has correct link hrefs', () => {
      render(<Nav />);
      const woLink = screen.getByText('Work Orders').closest('a');
      expect(woLink).toHaveAttribute('href', '/work-orders');
    });

    it('has accessible navigation landmark', () => {
      render(<Nav />);
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('root loading has aria-busy and role="status"', () => {
      render(<RootLoading />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-busy', 'true');
    });

    it('work orders loading has correct aria-label', () => {
      render(<WorkOrdersLoading />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Loading work orders');
    });

    it('technicians loading has correct aria-label', () => {
      render(<TechniciansLoading />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Loading technicians');
    });

    it('schedule loading has correct aria-label', () => {
      render(<ScheduleLoading />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Loading schedule');
    });
  });
});
