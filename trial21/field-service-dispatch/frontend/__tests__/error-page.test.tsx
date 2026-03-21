import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ErrorPage from '@/app/error';

expect.extend(toHaveNoViolations);

describe('ErrorPage', () => {
  const mockReset = jest.fn();
  const mockError = new Error('Test error message');

  beforeEach(() => {
    mockReset.mockClear();
  });

  it('renders with role="alert" for accessibility', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('displays heading', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays fallback message when error.message is empty', () => {
    const emptyError = new Error('');
    render(<ErrorPage error={emptyError} reset={mockReset} />);
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
  });

  it('renders a try again button', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls reset when try again is clicked', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    screen.getByRole('button', { name: /try again/i }).click();
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
