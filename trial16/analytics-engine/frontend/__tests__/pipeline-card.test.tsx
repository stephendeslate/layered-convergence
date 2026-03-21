import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PipelineCard } from '@/components/dashboard/pipeline-card';
import type { Pipeline } from '@/lib/types';

const mockPipeline: Pipeline = {
  id: 'pl-1',
  tenantId: 'tenant-1',
  name: 'ETL Pipeline',
  description: 'Extract and transform sales data',
  dataSourceId: 'ds-1',
  dataSource: {
    id: 'ds-1',
    tenantId: 'tenant-1',
    name: 'Sales DB',
    type: 'POSTGRESQL',
    config: {},
    status: 'ACTIVE',
    lastSyncAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  status: 'DRAFT',
  config: { steps: [] },
  createdAt: '2026-01-15T08:00:00Z',
  updatedAt: '2026-03-20T06:00:00Z',
};

describe('PipelineCard', () => {
  it('should render pipeline name', () => {
    render(<PipelineCard pipeline={mockPipeline} />);
    expect(screen.getByText('ETL Pipeline')).toBeInTheDocument();
  });

  it('should render pipeline status badge', () => {
    render(<PipelineCard pipeline={mockPipeline} />);
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });

  it('should render description when present', () => {
    render(<PipelineCard pipeline={mockPipeline} />);
    expect(screen.getByText('Extract and transform sales data')).toBeInTheDocument();
  });

  it('should render data source name', () => {
    render(<PipelineCard pipeline={mockPipeline} />);
    expect(screen.getByText('Sales DB')).toBeInTheDocument();
  });

  it('should render ACTIVE status for active pipelines', () => {
    const active = { ...mockPipeline, status: 'ACTIVE' as const };
    render(<PipelineCard pipeline={active} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('should render FAILED status for failed pipelines', () => {
    const failed: Pipeline = { ...mockPipeline, status: 'FAILED' };
    render(<PipelineCard pipeline={failed} />);
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  it('should render PAUSED status', () => {
    const paused: Pipeline = { ...mockPipeline, status: 'PAUSED' };
    render(<PipelineCard pipeline={paused} />);
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
  });

  it('should render COMPLETED status', () => {
    const completed: Pipeline = { ...mockPipeline, status: 'COMPLETED' };
    render(<PipelineCard pipeline={completed} />);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('should fall back to dataSourceId when dataSource is missing', () => {
    const noDs = { ...mockPipeline, dataSource: undefined };
    render(<PipelineCard pipeline={noDs} />);
    expect(screen.getByText('ds-1')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<PipelineCard pipeline={mockPipeline} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
