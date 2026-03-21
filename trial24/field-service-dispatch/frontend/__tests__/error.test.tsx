// [TRACED:TS-008] Tests verifying error.tsx renders error message and reset button

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RootError from '../app/error';

describe('Error components', () => {
  it('renders error message', () => {
    const error = new Error('Test error message');
    render(<RootError error={error} reset={() => {}} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders fallback message for empty error', () => {
    const error = new Error('');
    render(<RootError error={error} reset={() => {}} />);
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
  });

  it('calls reset when try again button is clicked', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const error = new Error('Test');
    render(<RootError error={error} reset={reset} />);

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('renders the "Something went wrong" heading', () => {
    const error = new Error('fail');
    render(<RootError error={error} reset={() => {}} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
