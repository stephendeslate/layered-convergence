import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Nav } from './nav';

expect.extend(toHaveNoViolations);

describe('Nav', () => {
  it('should render navigation with aria-label', () => {
    const { getByRole } = render(<Nav />);
    const nav = getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('should have links to main sections', () => {
    const { getByText } = render(<Nav />);
    expect(getByText('Transactions')).toBeDefined();
    expect(getByText('Disputes')).toBeDefined();
    expect(getByText('Payouts')).toBeDefined();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
