import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AvailabilityBadge } from '@/components/technicians/availability-badge';

expect.extend(toHaveNoViolations);

describe('AvailabilityBadge', () => {
  it('renders Available text', () => {
    render(<AvailabilityBadge availability="AVAILABLE" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders Busy text', () => {
    render(<AvailabilityBadge availability="BUSY" />);
    expect(screen.getByText('Busy')).toBeInTheDocument();
  });

  it('renders Off Duty text', () => {
    render(<AvailabilityBadge availability="OFF_DUTY" />);
    expect(screen.getByText('Off Duty')).toBeInTheDocument();
  });

  it('renders On Leave text', () => {
    render(<AvailabilityBadge availability="ON_LEAVE" />);
    expect(screen.getByText('On Leave')).toBeInTheDocument();
  });

  it('has aria-label with availability', () => {
    render(<AvailabilityBadge availability="AVAILABLE" />);
    expect(screen.getByLabelText('Availability: Available')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AvailabilityBadge availability="AVAILABLE" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
