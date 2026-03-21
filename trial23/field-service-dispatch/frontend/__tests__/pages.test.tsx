// TRACED:AXE_CORE_TESTS — axe-core tests present in all frontend test files

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DashboardPage from '@/app/page';
import LoginPage from '@/app/login/page';
import RegisterPage from '@/app/register/page';
import WorkOrdersPage from '@/app/work-orders/page';
import TechniciansPage from '@/app/technicians/page';
import CustomersPage from '@/app/customers/page';
import InvoicesPage from '@/app/invoices/page';
import RoutesPage from '@/app/routes/page';
import GpsEventsPage from '@/app/gps-events/page';

expect.extend(toHaveNoViolations);

describe('Dashboard Page', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<DashboardPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display the title', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Field Service Dispatch')).toBeDefined();
  });
});

describe('Login Page', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have email and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
  });
});

describe('Register Page', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have registration fields', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByLabelText('Role')).toBeDefined();
  });
});

describe('Work Orders Page', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<WorkOrdersPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display the title', () => {
    render(<WorkOrdersPage />);
    expect(screen.getByText('Work Orders')).toBeDefined();
  });
});

describe('Technicians Page', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<TechniciansPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display the title', () => {
    render(<TechniciansPage />);
    expect(screen.getByText('Technicians')).toBeDefined();
  });
});

describe('Customers Page', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<CustomersPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display the title', () => {
    render(<CustomersPage />);
    expect(screen.getByText('Customers')).toBeDefined();
  });
});

describe('Invoices Page', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<InvoicesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display the title', () => {
    render(<InvoicesPage />);
    expect(screen.getByText('Invoices')).toBeDefined();
  });
});

describe('Routes Page', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<RoutesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display the title', () => {
    render(<RoutesPage />);
    expect(screen.getByText('Routes')).toBeDefined();
  });
});

describe('GPS Events Page', () => {
  it('should render without accessibility violations', async () => {
    const { container } = render(<GpsEventsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display the title', () => {
    render(<GpsEventsPage />);
    expect(screen.getByText('GPS Events')).toBeDefined();
  });
});
