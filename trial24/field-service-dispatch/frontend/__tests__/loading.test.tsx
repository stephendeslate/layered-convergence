// [TRACED:TS-007] Tests verifying loading.tsx exists and renders for all routes

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLoading from '../app/loading';
import LoginLoading from '../app/login/loading';
import WorkOrdersLoading from '../app/work-orders/loading';
import CustomersLoading from '../app/customers/loading';
import InvoicesLoading from '../app/invoices/loading';
import RoutesLoading from '../app/routes/loading';

describe('Loading components', () => {
  it('renders root loading', () => {
    render(<RootLoading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders login loading', () => {
    render(<LoginLoading />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('renders work orders loading', () => {
    render(<WorkOrdersLoading />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('renders customers loading', () => {
    render(<CustomersLoading />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('renders invoices loading', () => {
    render(<InvoicesLoading />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('renders routes loading', () => {
    render(<RoutesLoading />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });
});
