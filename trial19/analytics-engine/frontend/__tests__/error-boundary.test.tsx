import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import ErrorBoundary from '@/app/error';

describe('ErrorBoundary', () => {
  const mockReset = () => {};

  it('renders error message with alert role', () => {
    render(<ErrorBoundary error={new Error('Test error message')} reset={mockReset} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Test error message');
  });

  it('displays heading', () => {
    render(<ErrorBoundary error={new Error('fail')} reset={mockReset} />);

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
  });

  it('renders try again button', () => {
    render(<ErrorBoundary error={new Error('fail')} reset={mockReset} />);

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls reset when try again is clicked', async () => {
    const user = userEvent.setup();
    let resetCalled = false;
    const reset = () => { resetCalled = true; };

    render(<ErrorBoundary error={new Error('fail')} reset={reset} />);
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(resetCalled).toBe(true);
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<ErrorBoundary error={new Error('fail')} reset={mockReset} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
