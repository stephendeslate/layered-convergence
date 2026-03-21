import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoadingSkeleton, TableSkeleton, FormSkeleton } from './loading-skeleton';

expect.extend(toHaveNoViolations);

describe('LoadingSkeleton', () => {
  it('should render with role="status"', () => {
    render(<LoadingSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should have aria-busy="true"', () => {
    render(<LoadingSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<LoadingSkeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('TableSkeleton', () => {
  it('should render with role="status" and aria-busy', () => {
    render(<TableSkeleton />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<TableSkeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('FormSkeleton', () => {
  it('should render with role="status" and aria-busy', () => {
    render(<FormSkeleton />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<FormSkeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
