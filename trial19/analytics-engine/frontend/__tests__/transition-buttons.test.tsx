import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

vi.mock('@/app/actions', () => ({
  transitionPipeline: vi.fn(),
}));

import { TransitionButtons } from '@/app/pipelines/transition-buttons';

describe('TransitionButtons', () => {
  it('renders ACTIVE transition for DRAFT status', () => {
    render(<TransitionButtons pipelineId="p1" currentStatus="DRAFT" />);

    expect(screen.getByRole('button', { name: /transition pipeline to active/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /transition pipeline to paused/i })).not.toBeInTheDocument();
  });

  it('renders PAUSED and ARCHIVED transitions for ACTIVE status', () => {
    render(<TransitionButtons pipelineId="p1" currentStatus="ACTIVE" />);

    expect(screen.getByRole('button', { name: /transition pipeline to paused/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /transition pipeline to archived/i })).toBeInTheDocument();
  });

  it('renders ACTIVE and ARCHIVED transitions for PAUSED status', () => {
    render(<TransitionButtons pipelineId="p1" currentStatus="PAUSED" />);

    expect(screen.getByRole('button', { name: /transition pipeline to active/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /transition pipeline to archived/i })).toBeInTheDocument();
  });

  it('renders DRAFT transition for ARCHIVED status', () => {
    render(<TransitionButtons pipelineId="p1" currentStatus="ARCHIVED" />);

    expect(screen.getByRole('button', { name: /transition pipeline to draft/i })).toBeInTheDocument();
  });

  it('shows no transitions message for unknown status', () => {
    render(<TransitionButtons pipelineId="p1" currentStatus="UNKNOWN" />);

    expect(screen.getByText(/no transitions available/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('includes hidden inputs with pipelineId and status', () => {
    const { container } = render(<TransitionButtons pipelineId="p1" currentStatus="DRAFT" />);

    const hiddenInputs = container.querySelectorAll('input[type="hidden"]');
    const names = Array.from(hiddenInputs).map((el) => (el as HTMLInputElement).name);
    expect(names).toContain('pipelineId');
    expect(names).toContain('status');
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<TransitionButtons pipelineId="p1" currentStatus="ACTIVE" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
