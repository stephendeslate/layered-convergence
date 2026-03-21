import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TransitionButtons } from './transition-buttons';

expect.extend(toHaveNoViolations);

vi.mock('@/lib/actions', () => ({
  updateStatusAction: vi.fn(),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: () => [{ error: null, success: false }, vi.fn(), false],
  };
});

describe('TransitionButtons', () => {
  it('should render transition buttons for PENDING status', () => {
    render(<TransitionButtons transactionId="tx-1" currentStatus="PENDING" />);
    expect(screen.getByRole('button', { name: 'Fund' })).toBeInTheDocument();
  });

  it('should render multiple buttons for FUNDED status', () => {
    render(<TransitionButtons transactionId="tx-1" currentStatus="FUNDED" />);
    expect(screen.getByRole('button', { name: 'Ship' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dispute' })).toBeInTheDocument();
  });

  it('should render nothing for terminal status RELEASED', () => {
    const { container } = render(
      <TransitionButtons transactionId="tx-1" currentStatus="RELEASED" />,
    );
    expect(container.querySelector('button')).toBeNull();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TransitionButtons transactionId="tx-1" currentStatus="PENDING" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have hidden inputs for form submission', () => {
    render(<TransitionButtons transactionId="tx-1" currentStatus="PENDING" />);
    const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
    expect(hiddenInputs.length).toBeGreaterThan(0);
  });
});
