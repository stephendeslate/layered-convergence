import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Loading from '@/app/loading';
import WorkOrdersLoading from '@/app/work-orders/loading';
import TechniciansLoading from '@/app/technicians/loading';
import RoutesLoading from '@/app/routes/loading';
import WorkOrderDetailLoading from '@/app/work-orders/[id]/loading';
import TechnicianDetailLoading from '@/app/technicians/[id]/loading';
import CreateWorkOrderLoading from '@/app/work-orders/new/loading';

expect.extend(toHaveNoViolations);

describe('Loading Pages', () => {
  it('should render root loading page with skeletons', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('should render work orders loading page with skeletons', () => {
    const { container } = render(<WorkOrdersLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('should render technicians loading page with skeletons', () => {
    const { container } = render(<TechniciansLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('should render routes loading page with skeletons', () => {
    const { container } = render(<RoutesLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('should render work order detail loading page with skeletons', () => {
    const { container } = render(<WorkOrderDetailLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('should render technician detail loading page with skeletons', () => {
    const { container } = render(<TechnicianDetailLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('should render create work order loading page with skeletons', () => {
    const { container } = render(<CreateWorkOrderLoading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('should have no accessibility violations for root loading', async () => {
    const { container } = render(<Loading />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations for work orders loading', async () => {
    const { container } = render(<WorkOrdersLoading />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations for technicians loading', async () => {
    const { container } = render(<TechniciansLoading />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations for routes loading', async () => {
    const { container } = render(<RoutesLoading />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
