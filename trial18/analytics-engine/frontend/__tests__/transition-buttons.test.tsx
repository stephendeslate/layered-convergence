import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { TransitionButtons } from '@/components/dashboard/transition-buttons';

vi.mock('@/app/actions', () => ({
  transitionPipeline: vi.fn(),
}));

describe('TransitionButtons', () => {
  it('shows ACTIVE button for DRAFT status', () => {
    render(<TransitionButtons pipelineId="p1" currentStatus="DRAFT" />);

    expect(screen.getByRole('button', { name: 'ACTIVE' })).toBeInTheDocument();
  });

  it('shows PAUSED, FAILED, COMPLETED buttons for ACTIVE status', () => {
    render(<TransitionButtons pipelineId="p1" currentStatus="ACTIVE" />);

    expect(screen.getByRole('button', { name: 'PAUSED' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'FAILED' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'COMPLETED' })).toBeInTheDocument();
  });

  it('shows only ACTIVE button for PAUSED status', () => {
    render(<TransitionButtons pipelineId="p1" currentStatus="PAUSED" />);

    expect(screen.getByRole('button', { name: 'ACTIVE' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'FAILED' })).not.toBeInTheDocument();
  });

  it('shows DRAFT button for FAILED status', () => {
    render(<TransitionButtons pipelineId="p1" currentStatus="FAILED" />);

    expect(screen.getByRole('button', { name: 'DRAFT' })).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(
      <TransitionButtons pipelineId="p1" currentStatus="ACTIVE" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
