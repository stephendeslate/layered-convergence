import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import Error from '@/app/error';

describe('Error boundary', () => {
  it('should render error message', () => {
    const error = new Error('Something broke');
    render(<Error error={error} reset={vi.fn()} />);
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('should render heading', () => {
    const error = new Error('Test');
    render(<Error error={error} reset={vi.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render try again button', () => {
    const error = new Error('Test');
    render(<Error error={error} reset={vi.fn()} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should call reset on button click', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const error = new Error('Test');
    render(<Error error={error} reset={reset} />);
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('should show fallback message when error.message is empty', () => {
    const error = new Error('');
    render(<Error error={error} reset={vi.fn()} />);
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const error = new Error('Accessible error');
    const { container } = render(<Error error={error} reset={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
