import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Error from '../app/error';

expect.extend(toHaveNoViolations);

describe('Error Page', () => {
  const mockReset = jest.fn();
  const mockError = new Error('Test error');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error message with role="alert"', () => {
    render(<Error error={mockError} reset={mockReset} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Error error={mockError} reset={mockReset} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('calls reset when try again button is clicked', () => {
    render(<Error error={mockError} reset={mockReset} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('try again button is keyboard accessible', async () => {
    render(<Error error={mockError} reset={mockReset} />);
    const button = screen.getByRole('button', { name: /try again/i });
    button.focus();
    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: 'Enter' });
  });
});
