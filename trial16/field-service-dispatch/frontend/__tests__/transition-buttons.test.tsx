import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TransitionButtons } from '@/components/work-orders/transition-buttons';

expect.extend(toHaveNoViolations);

const mockFormAction = vi.fn();

vi.mock('react', async () => {
  const actualReact = await vi.importActual<typeof import('react')>('react');
  return {
    ...actualReact,
    useActionState: vi.fn(() => [null, mockFormAction, false]),
  };
});

vi.mock('@/app/actions', () => ({
  transitionWorkOrder: vi.fn(),
}));

describe('TransitionButtons', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useActionState } = vi.mocked(await import('react'));
    (useActionState as ReturnType<typeof vi.fn>).mockReturnValue([null, mockFormAction, false]);
  });

  it('should render transition buttons for CREATED status', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="CREATED" />);
    expect(screen.getByText('Assigned')).toBeInTheDocument();
  });

  it('should render only EN_ROUTE for ASSIGNED status (no backward transition)', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="ASSIGNED" />);
    expect(screen.getByText('En Route')).toBeInTheDocument();
    expect(screen.queryByText('Created')).not.toBeInTheDocument();
  });

  it('should render only IN_PROGRESS for EN_ROUTE status (no backward transition)', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="EN_ROUTE" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.queryByText('Assigned')).not.toBeInTheDocument();
  });

  it('should render ON_HOLD and COMPLETED for IN_PROGRESS status', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="IN_PROGRESS" />);
    expect(screen.getByText('On Hold')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render only IN_PROGRESS for ON_HOLD status (no COMPLETED)', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="ON_HOLD" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
  });

  it('should render INVOICED for COMPLETED status', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="COMPLETED" />);
    expect(screen.getByText('Invoiced')).toBeInTheDocument();
  });

  it('should render PAID for INVOICED status', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="INVOICED" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('should render CLOSED for PAID status', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="PAID" />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('should show no-transitions message for CLOSED status', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="CLOSED" />);
    expect(screen.getByText(/No available transitions from Closed/)).toBeInTheDocument();
  });

  it('should render hidden inputs with workOrderId and status', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="CREATED" />);
    const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
    const workOrderInput = Array.from(hiddenInputs).find(
      (input) => (input as HTMLInputElement).name === 'workOrderId',
    ) as HTMLInputElement;
    const statusInput = Array.from(hiddenInputs).find(
      (input) => (input as HTMLInputElement).name === 'status',
    ) as HTMLInputElement;

    expect(workOrderInput).toBeDefined();
    expect(workOrderInput.value).toBe('wo-1');
    expect(statusInput).toBeDefined();
    expect(statusInput.value).toBe('ASSIGNED');
  });

  it('should render a group with aria-label', () => {
    render(<TransitionButtons workOrderId="wo-1" currentStatus="CREATED" />);
    expect(screen.getByRole('group', { name: 'Work order transitions' })).toBeInTheDocument();
  });

  it('should display error message when state has error', async () => {
    const { useActionState } = vi.mocked(await import('react'));
    (useActionState as ReturnType<typeof vi.fn>).mockReturnValue([{ error: 'Transition failed' }, mockFormAction, false]);

    render(<TransitionButtons workOrderId="wo-1" currentStatus="CREATED" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Transition failed');
  });

  it('should disable buttons when pending', async () => {
    const { useActionState } = vi.mocked(await import('react'));
    (useActionState as ReturnType<typeof vi.fn>).mockReturnValue([null, mockFormAction, true]);

    render(<TransitionButtons workOrderId="wo-1" currentStatus="IN_PROGRESS" />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should have correct number of buttons for each status', () => {
    const expectedCounts: Record<string, number> = {
      CREATED: 1,
      ASSIGNED: 1,
      EN_ROUTE: 1,
      IN_PROGRESS: 2,
      ON_HOLD: 1,
      COMPLETED: 1,
      INVOICED: 1,
      PAID: 1,
      CLOSED: 0,
    };

    for (const [status, count] of Object.entries(expectedCounts)) {
      const { unmount } = render(
        <TransitionButtons workOrderId="wo-1" currentStatus={status as any} />,
      );
      if (count > 0) {
        expect(screen.getAllByRole('button')).toHaveLength(count);
      } else {
        expect(screen.queryAllByRole('button')).toHaveLength(0);
      }
      unmount();
    }
  });

  it('should have no accessibility violations with transitions', async () => {
    const { container } = render(
      <TransitionButtons workOrderId="wo-1" currentStatus="IN_PROGRESS" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with no transitions', async () => {
    const { container } = render(
      <TransitionButtons workOrderId="wo-1" currentStatus="CLOSED" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
