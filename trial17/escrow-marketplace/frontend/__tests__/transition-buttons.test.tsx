import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TransitionButtons } from '@/components/transactions/transition-buttons';

expect.extend(toHaveNoViolations);

// Mock the server action
jest.mock('@/app/actions', () => ({
  transitionTransactionAction: jest.fn(),
}));

// Mock useActionState
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useActionState: jest.fn(() => [{}, jest.fn(), false]),
  };
});

describe('TransitionButtons', () => {
  it('renders transition buttons for PENDING status', () => {
    render(
      <TransitionButtons transactionId="txn-1" currentStatus="PENDING" />,
    );
    expect(screen.getByText('Fund')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders transition buttons for FUNDED status', () => {
    render(
      <TransitionButtons transactionId="txn-1" currentStatus="FUNDED" />,
    );
    expect(screen.getByText('Mark Shipped')).toBeInTheDocument();
    expect(screen.getByText('Dispute')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders no actions message for RELEASED (terminal)', () => {
    render(
      <TransitionButtons transactionId="txn-1" currentStatus="RELEASED" />,
    );
    expect(
      screen.getByText(/No actions available/),
    ).toBeInTheDocument();
  });

  it('renders no actions message for REFUNDED (terminal)', () => {
    render(
      <TransitionButtons transactionId="txn-1" currentStatus="REFUNDED" />,
    );
    expect(
      screen.getByText(/No actions available/),
    ).toBeInTheDocument();
  });

  it('renders REFUNDED option for CANCELLED status', () => {
    render(
      <TransitionButtons transactionId="txn-1" currentStatus="CANCELLED" />,
    );
    expect(screen.getByText('Refund')).toBeInTheDocument();
  });

  it('includes hidden inputs for transactionId and action', () => {
    const { container } = render(
      <TransitionButtons transactionId="txn-1" currentStatus="PENDING" />,
    );
    const hiddenInputs = container.querySelectorAll('input[type="hidden"]');
    const names = Array.from(hiddenInputs).map((el) =>
      el.getAttribute('name'),
    );
    expect(names).toContain('transactionId');
    expect(names).toContain('action');
  });

  it('has role="group" on the button container', () => {
    render(
      <TransitionButtons transactionId="txn-1" currentStatus="PENDING" />,
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TransitionButtons transactionId="txn-1" currentStatus="FUNDED" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
