import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Badge } from './badge';

expect.extend(toHaveNoViolations);

describe('Badge', () => {
  it('should render with default variant', () => {
    render(<Badge>PENDING</Badge>);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('should render with destructive variant', () => {
    render(<Badge variant="destructive">DISPUTED</Badge>);
    expect(screen.getByText('DISPUTED')).toBeInTheDocument();
  });

  it('should render with success variant', () => {
    render(<Badge variant="success">RELEASED</Badge>);
    expect(screen.getByText('RELEASED')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
