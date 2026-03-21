import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Badge } from '@/components/ui/badge';

expect.extend(toHaveNoViolations);

describe('Badge', () => {
  it('should render with default variant', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('should render with status variants', () => {
    const { rerender } = render(<Badge variant="pending">PENDING</Badge>);
    expect(screen.getByText('PENDING')).toBeInTheDocument();

    rerender(<Badge variant="completed">COMPLETED</Badge>);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('should render with availability variants', () => {
    const { rerender } = render(<Badge variant="available">AVAILABLE</Badge>);
    expect(screen.getByText('AVAILABLE')).toBeInTheDocument();

    rerender(<Badge variant="onJob">ON JOB</Badge>);
    expect(screen.getByText('ON JOB')).toBeInTheDocument();

    rerender(<Badge variant="offDuty">OFF DUTY</Badge>);
    expect(screen.getByText('OFF DUTY')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Badge>Test Badge</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
