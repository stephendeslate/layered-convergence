import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import ErrorPage from '@/app/error';

expect.extend(toHaveNoViolations);

describe('ErrorPage', () => {
  const mockReset = vi.fn();
  const mockError = new Error('Test error message') as Error & { digest?: string };

  it('should render error heading', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should display fallback message when error.message is empty', () => {
    const emptyError = new Error('') as Error & { digest?: string };
    render(<ErrorPage error={emptyError} reset={mockReset} />);
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
  });

  it('should render try again button', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should call reset when try again is clicked', async () => {
    const user = userEvent.setup();
    render(<ErrorPage error={mockError} reset={mockReset} />);
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
