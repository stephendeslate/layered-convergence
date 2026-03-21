import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Error from '@/app/error';

describe('Error Page', () => {
  const mockReset = vi.fn();
  const defaultError = new window.Error('Test error message');

  it('renders the error message', () => {
    render(<Error error={defaultError} reset={mockReset} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders the heading', () => {
    render(<Error error={defaultError} reset={mockReset} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has role="alert" on the container', () => {
    render(<Error error={defaultError} reset={mockReset} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls reset when Try again button is clicked', () => {
    render(<Error error={defaultError} reset={mockReset} />);
    fireEvent.click(screen.getByText('Try again'));
    expect(mockReset).toHaveBeenCalledOnce();
  });

  it('renders fallback message when error has no message', () => {
    const emptyError = new window.Error('');
    render(<Error error={emptyError} reset={mockReset} />);
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(<Error error={defaultError} reset={mockReset} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
