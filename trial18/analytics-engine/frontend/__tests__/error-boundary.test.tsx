import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import ErrorBoundary from '@/app/error';

describe('ErrorBoundary', () => {
  it('renders error message and reset button', () => {
    const resetFn = vi.fn();

    render(<ErrorBoundary error={new Error('Test error message')} reset={resetFn} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('has alert role for accessibility', () => {
    render(<ErrorBoundary error={new Error('fail')} reset={vi.fn()} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(
      <ErrorBoundary error={new Error('fail')} reset={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
