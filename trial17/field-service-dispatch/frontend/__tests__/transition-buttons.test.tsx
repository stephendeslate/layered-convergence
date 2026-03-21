import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TransitionButtons } from '@/components/work-orders/transition-buttons';

expect.extend(toHaveNoViolations);

vi.mock('@/app/actions', () => ({
  transitionWorkOrderAction: vi.fn(),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: vi.fn((fn: any, init: any) => [init, vi.fn(), false]),
  };
});

describe('TransitionButtons', () => {
  it('renders transition buttons for CREATED status', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="CREATED" />);
    expect(screen.getByLabelText('Transition to Assigned')).toBeInTheDocument();
    expect(screen.getByLabelText('Transition to Cancelled')).toBeInTheDocument();
  });

  it('renders transition buttons for IN_PROGRESS status', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="IN_PROGRESS" />);
    expect(screen.getByLabelText('Transition to On Hold')).toBeInTheDocument();
    expect(screen.getByLabelText('Transition to Completed')).toBeInTheDocument();
    expect(screen.getByLabelText('Transition to Cancelled')).toBeInTheDocument();
  });

  it('renders nothing for CLOSED status', () => {
    const { container } = render(<TransitionButtons workOrderId="wo-1" currentStatus="CLOSED" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing for CANCELLED status', () => {
    const { container } = render(<TransitionButtons workOrderId="wo-1" currentStatus="CANCELLED" />);
    expect(container.innerHTML).toBe('');
  });

  it('has group role with aria-label', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="CREATED" />);
    expect(screen.getByRole('group', { name: 'Status transition actions' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TransitionButtons workOrderId="wo-1" currentStatus="CREATED" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
