import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import ErrorBoundary from './error';

expect.extend(toHaveNoViolations);

describe('ErrorBoundary', () => {
  it('should render error message', () => {
    const error = new Error('Something went wrong');
    render(<ErrorBoundary error={error} reset={() => {}} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should have role="alert"', () => {
    const error = new Error('Test error');
    render(<ErrorBoundary error={error} reset={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should call reset when try again is clicked', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const error = new Error('Test error');
    render(<ErrorBoundary error={error} reset={reset} />);

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const error = new Error('Test error');
    render(<ErrorBoundary error={error} reset={reset} />);

    await user.tab();
    const button = screen.getByRole('button', { name: 'Try again' });
    expect(document.activeElement).toBe(button);

    await user.keyboard('{Enter}');
    expect(reset).toHaveBeenCalledOnce();
  });

  it('should have no accessibility violations', async () => {
    const error = new Error('Test error');
    const { container } = render(<ErrorBoundary error={error} reset={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
