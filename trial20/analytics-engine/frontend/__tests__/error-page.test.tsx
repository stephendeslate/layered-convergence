import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Error from '@/app/error';

describe('Error Page', () => {
  it('renders with role="alert"', () => {
    render(<Error error={new Error('Test error')} reset={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Error error={new Error('Something broke')} reset={vi.fn()} />);
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('calls reset on button click', async () => {
    const reset = vi.fn();
    render(<Error error={new Error('Error')} reset={reset} />);
    const button = screen.getByRole('button', { name: 'Try again' });
    button.click();
    expect(reset).toHaveBeenCalled();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Error error={new Error('Error')} reset={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
