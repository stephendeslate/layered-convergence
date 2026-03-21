import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TransitionButtons } from '@/components/dashboard/transition-buttons';

const mockTransitionPipeline = vi.fn();

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useTransition: () => [false, (fn: Function) => fn()],
  };
});

vi.mock('@/app/actions', () => ({
  transitionPipeline: (...args: unknown[]) => mockTransitionPipeline(...args),
}));

describe('TransitionButtons', () => {
  beforeEach(() => {
    mockTransitionPipeline.mockReset();
    mockTransitionPipeline.mockResolvedValue({ status: 'ACTIVE' });
  });

  it('should render Activate button for DRAFT status', () => {
    render(<TransitionButtons pipelineId="pl-1" currentStatus="DRAFT" />);
    expect(screen.getByRole('button', { name: /activate pipeline/i })).toBeInTheDocument();
  });

  it('should render Pause, Mark Failed, and Complete buttons for ACTIVE status', () => {
    render(<TransitionButtons pipelineId="pl-1" currentStatus="ACTIVE" />);
    expect(screen.getByRole('button', { name: /pause pipeline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark failed pipeline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /complete pipeline/i })).toBeInTheDocument();
  });

  it('should render Activate and Mark Failed buttons for PAUSED status', () => {
    render(<TransitionButtons pipelineId="pl-1" currentStatus="PAUSED" />);
    expect(screen.getByRole('button', { name: /activate pipeline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark failed pipeline/i })).toBeInTheDocument();
  });

  it('should render Reset to Draft button for FAILED status', () => {
    render(<TransitionButtons pipelineId="pl-1" currentStatus="FAILED" />);
    expect(screen.getByRole('button', { name: /reset to draft pipeline/i })).toBeInTheDocument();
  });

  it('should render Reset to Draft button for COMPLETED status', () => {
    render(<TransitionButtons pipelineId="pl-1" currentStatus="COMPLETED" />);
    expect(screen.getByRole('button', { name: /reset to draft pipeline/i })).toBeInTheDocument();
  });

  it('should call transitionPipeline with correct args on click', async () => {
    const user = userEvent.setup();
    render(<TransitionButtons pipelineId="pl-1" currentStatus="DRAFT" />);
    await user.click(screen.getByRole('button', { name: /activate pipeline/i }));
    expect(mockTransitionPipeline).toHaveBeenCalledWith('pl-1', 'ACTIVE');
  });

  it('should call transitionPipeline with PAUSED on pause click', async () => {
    const user = userEvent.setup();
    render(<TransitionButtons pipelineId="pl-1" currentStatus="ACTIVE" />);
    await user.click(screen.getByRole('button', { name: /pause pipeline/i }));
    expect(mockTransitionPipeline).toHaveBeenCalledWith('pl-1', 'PAUSED');
  });

  it('should display error message when transition fails', async () => {
    mockTransitionPipeline.mockRejectedValue(new Error('Invalid transition'));
    const user = userEvent.setup();
    render(<TransitionButtons pipelineId="pl-1" currentStatus="DRAFT" />);
    await user.click(screen.getByRole('button', { name: /activate pipeline/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid transition');
  });

  it('should have a button group with aria-label', () => {
    render(<TransitionButtons pipelineId="pl-1" currentStatus="ACTIVE" />);
    expect(screen.getByRole('group', { name: /pipeline transition actions/i })).toBeInTheDocument();
  });

  it('should have no accessibility violations for DRAFT state', async () => {
    const { container } = render(<TransitionButtons pipelineId="pl-1" currentStatus="DRAFT" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations for ACTIVE state', async () => {
    const { container } = render(<TransitionButtons pipelineId="pl-1" currentStatus="ACTIVE" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
