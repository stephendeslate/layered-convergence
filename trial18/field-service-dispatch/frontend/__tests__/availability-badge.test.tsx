import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { AvailabilityBadge } from '@/components/technicians/availability-badge';

describe('AvailabilityBadge', () => {
  it('should render Available when available is true', () => {
    const { getByText } = render(<AvailabilityBadge available={true} />);
    expect(getByText('Available')).toBeTruthy();
  });

  it('should render Unavailable when available is false', () => {
    const { getByText } = render(<AvailabilityBadge available={false} />);
    expect(getByText('Unavailable')).toBeTruthy();
  });

  it('should have no accessibility violations when available', async () => {
    const { container } = render(<AvailabilityBadge available={true} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when unavailable', async () => {
    const { container } = render(<AvailabilityBadge available={false} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
