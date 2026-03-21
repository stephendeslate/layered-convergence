import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoadingSkeleton } from './loading-skeleton';

expect.extend(toHaveNoViolations);

describe('LoadingSkeleton', () => {
  it('should render loading skeleton', () => {
    const { container } = render(<LoadingSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeDefined();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<LoadingSkeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
