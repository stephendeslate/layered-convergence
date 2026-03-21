import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TransitionButtons } from './transition-buttons';

expect.extend(toHaveNoViolations);

describe('TransitionButtons', () => {
  it('should render available transitions for PENDING status', () => {
    const { getByLabelText } = render(
      <TransitionButtons transactionId="tx-1" currentStatus="PENDING" />,
    );

    expect(getByLabelText('Transition to FUNDED')).toBeDefined();
    expect(getByLabelText('Transition to CANCELLED')).toBeDefined();
  });

  it('should show no transitions for COMPLETED status', () => {
    const { getByText } = render(
      <TransitionButtons transactionId="tx-1" currentStatus="COMPLETED" />,
    );

    expect(getByText('No available transitions')).toBeDefined();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TransitionButtons transactionId="tx-1" currentStatus="FUNDED" />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should render transitions for DISPUTED status', () => {
    const { getByLabelText } = render(
      <TransitionButtons transactionId="tx-1" currentStatus="DISPUTED" />,
    );

    expect(getByLabelText('Transition to REFUNDED')).toBeDefined();
    expect(getByLabelText('Transition to RELEASED')).toBeDefined();
  });
});
