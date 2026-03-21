import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('@/app/actions', () => ({
  createTransactionAction: jest.fn(),
}));

jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useActionState: jest.fn(() => [{}, jest.fn(), false]),
  };
});

import CreateTransactionPage from '@/app/transactions/create/page';

describe('CreateTransactionPage', () => {
  it('renders all form fields', () => {
    render(<CreateTransactionPage />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount (USD)')).toBeInTheDocument();
    expect(screen.getByLabelText('Seller ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<CreateTransactionPage />);
    expect(
      screen.getByRole('button', { name: 'Create Transaction' }),
    ).toBeInTheDocument();
  });

  it('amount input has correct attributes', () => {
    render(<CreateTransactionPage />);
    const amount = screen.getByLabelText('Amount (USD)');
    expect(amount).toHaveAttribute('type', 'number');
    expect(amount).toHaveAttribute('step', '0.01');
    expect(amount).toHaveAttribute('min', '0.01');
  });

  it('shows error message when state has error', () => {
    const mockUseActionState = require('react').useActionState;
    mockUseActionState.mockReturnValueOnce([
      { error: 'Amount must be positive' },
      jest.fn(),
      false,
    ]);

    render(<CreateTransactionPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Amount must be positive');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CreateTransactionPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
