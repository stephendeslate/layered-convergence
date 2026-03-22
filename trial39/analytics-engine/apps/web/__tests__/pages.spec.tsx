// TRACED:AE-SEC-07 — Page rendering tests for loading and error states

import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '../app/loading';
import DashboardsLoading from '../app/dashboards/loading';
import PipelinesLoading from '../app/pipelines/loading';
import ReportsLoading from '../app/reports/loading';

describe('Loading Pages', () => {
  it('root loading should have role=status and aria-busy', () => {
    render(<Loading />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('dashboards loading should have role=status and aria-busy', () => {
    render(<DashboardsLoading />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('pipelines loading should have role=status and aria-busy', () => {
    render(<PipelinesLoading />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('reports loading should have role=status and aria-busy', () => {
    render(<ReportsLoading />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
  });
});

describe('Error Pages', () => {
  it('should render error boundary with role=alert', async () => {
    const ErrorPage = (await import('../app/error')).default;
    const mockError = new Error('Test error message');
    const mockReset = jest.fn();

    render(<ErrorPage error={mockError} reset={mockReset} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('dashboards error should render with role=alert', async () => {
    const DashboardsError = (await import('../app/dashboards/error')).default;
    render(<DashboardsError error={new Error('Dashboard error')} reset={jest.fn()} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Dashboard error')).toBeInTheDocument();
  });

  it('pipelines error should render with role=alert', async () => {
    const PipelinesError = (await import('../app/pipelines/error')).default;
    render(<PipelinesError error={new Error('Pipeline error')} reset={jest.fn()} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('reports error should render with role=alert', async () => {
    const ReportsError = (await import('../app/reports/error')).default;
    render(<ReportsError error={new Error('Report error')} reset={jest.fn()} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
