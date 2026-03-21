import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@/app/actions', () => ({
  createTransaction: jest.fn().mockResolvedValue(undefined),
}));

import CreateTransactionPage from '@/app/transactions/create/page';

describe('CreateTransactionForm', () => {
  it('should render all form fields', () => {
    render(<CreateTransactionPage />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/seller id/i)).toBeInTheDocument();
  });

  it('should render create transaction button', () => {
    render(<CreateTransactionPage />);

    expect(
      screen.getByRole('button', { name: /create transaction/i }),
    ).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    render(<CreateTransactionPage />);

    expect(
      screen.getByRole('button', { name: /cancel/i }),
    ).toBeInTheDocument();
  });

  it('should allow filling in the form', async () => {
    const user = userEvent.setup();
    render(<CreateTransactionPage />);

    const titleInput = screen.getByLabelText(/title/i);
    const amountInput = screen.getByLabelText(/amount/i);
    const sellerInput = screen.getByLabelText(/seller id/i);

    await user.type(titleInput, 'New Transaction');
    await user.type(amountInput, '250.00');
    await user.type(sellerInput, 'seller-uuid');

    expect(titleInput).toHaveValue('New Transaction');
    expect(amountInput).toHaveValue(250);
    expect(sellerInput).toHaveValue('seller-uuid');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<CreateTransactionPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
