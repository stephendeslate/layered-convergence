import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-6" role="alert">
        <h3 className="text-destructive">Something went wrong</h3>
        <p className="text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset}>Try again</button>
      </div>
    </div>
  );
}

describe('ErrorPage', () => {
  it('renders error message with role="alert"', () => {
    render(<ErrorPage error={new Error('Test error')} reset={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('calls reset when Try again is clicked', async () => {
    const user = userEvent.setup();
    const reset = jest.fn();
    render(<ErrorPage error={new Error('Test error')} reset={reset} />);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<ErrorPage error={new Error('Test error')} reset={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
