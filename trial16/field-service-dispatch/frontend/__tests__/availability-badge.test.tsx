import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AvailabilityBadge } from '@/components/technicians/availability-badge';
import type { TechnicianAvailability } from '@/lib/types';

expect.extend(toHaveNoViolations);

describe('AvailabilityBadge', () => {
  it('should render Available state', () => {
    render(<AvailabilityBadge availability="AVAILABLE" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should render Busy state', () => {
    render(<AvailabilityBadge availability="BUSY" />);
    expect(screen.getByText('Busy')).toBeInTheDocument();
  });

  it('should render Off Duty state', () => {
    render(<AvailabilityBadge availability="OFF_DUTY" />);
    expect(screen.getByText('Off Duty')).toBeInTheDocument();
  });

  it('should have aria-label for Available', () => {
    render(<AvailabilityBadge availability="AVAILABLE" />);
    expect(screen.getByLabelText('Availability: Available')).toBeInTheDocument();
  });

  it('should have aria-label for Busy', () => {
    render(<AvailabilityBadge availability="BUSY" />);
    expect(screen.getByLabelText('Availability: Busy')).toBeInTheDocument();
  });

  it('should have aria-label for Off Duty', () => {
    render(<AvailabilityBadge availability="OFF_DUTY" />);
    expect(screen.getByLabelText('Availability: Off Duty')).toBeInTheDocument();
  });

  it.each<TechnicianAvailability>(['AVAILABLE', 'BUSY', 'OFF_DUTY'])(
    'should have no accessibility violations for %s',
    async (availability) => {
      const { container } = render(<AvailabilityBadge availability={availability} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    },
  );
});
