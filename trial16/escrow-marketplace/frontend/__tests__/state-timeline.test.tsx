import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StateTimeline } from '@/components/transactions/state-timeline';

expect.extend(toHaveNoViolations);

describe('StateTimeline', () => {
  it('should render the timeline container', () => {
    render(<StateTimeline currentStatus="PENDING" />);
    expect(screen.getByTestId('state-timeline')).toBeInTheDocument();
  });

  it('should render happy path steps for PENDING', () => {
    render(<StateTimeline currentStatus="PENDING" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Funded')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('Released')).toBeInTheDocument();
  });

  it('should render happy path steps for FUNDED', () => {
    render(<StateTimeline currentStatus="FUNDED" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Funded')).toBeInTheDocument();
  });

  it('should render happy path steps for SHIPPED', () => {
    render(<StateTimeline currentStatus="SHIPPED" />);
    expect(screen.getByText('Shipped')).toBeInTheDocument();
  });

  it('should render happy path steps for DELIVERED', () => {
    render(<StateTimeline currentStatus="DELIVERED" />);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('should render happy path steps for RELEASED', () => {
    render(<StateTimeline currentStatus="RELEASED" />);
    expect(screen.getByText('Released')).toBeInTheDocument();
  });

  it('should render alternate steps for CANCELLED', () => {
    render(<StateTimeline currentStatus="CANCELLED" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.queryByText('Funded')).not.toBeInTheDocument();
  });

  it('should render alternate steps for DISPUTED', () => {
    render(<StateTimeline currentStatus="DISPUTED" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Funded')).toBeInTheDocument();
    expect(screen.getByText('Disputed')).toBeInTheDocument();
  });

  it('should render alternate steps for RESOLVED', () => {
    render(<StateTimeline currentStatus="RESOLVED" />);
    expect(screen.getByText('Disputed')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('should render alternate steps for REFUNDED', () => {
    render(<StateTimeline currentStatus="REFUNDED" />);
    expect(screen.getByText('Refunded')).toBeInTheDocument();
  });

  it('should have no accessibility violations for happy path', async () => {
    const { container } = render(<StateTimeline currentStatus="FUNDED" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations for alternate path', async () => {
    const { container } = render(<StateTimeline currentStatus="DISPUTED" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
