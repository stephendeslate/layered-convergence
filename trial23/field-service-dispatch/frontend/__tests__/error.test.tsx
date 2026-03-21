import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Error from '@/app/error';

expect.extend(toHaveNoViolations);

describe('Error Component', () => {
  const mockError = new Error('Test error message');
  const mockReset = vi.fn();

  it('should render without accessibility violations', async () => {
    const { container } = render(<Error error={mockError} reset={mockReset} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have role="alert"', () => {
    render(<Error error={mockError} reset={mockReset} />);
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('should display error message', () => {
    render(<Error error={mockError} reset={mockReset} />);
    expect(screen.getByText('Test error message')).toBeDefined();
  });

  it('should have a try again button', () => {
    render(<Error error={mockError} reset={mockReset} />);
    expect(screen.getByText('Try again')).toBeDefined();
  });

  it('should focus the alert container on mount', () => {
    const { container } = render(<Error error={mockError} reset={mockReset} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert?.getAttribute('tabindex')).toBe('-1');
  });
});
