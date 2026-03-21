import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PipelineCard } from '@/components/dashboard/pipeline-card';
import type { Pipeline } from '@/lib/types';

const mockPipeline: Pipeline = {
  id: 'p1',
  tenantId: 't1',
  name: 'ETL Pipeline',
  description: 'Extract and transform data',
  status: 'ACTIVE',
  config: {},
  dataSourceId: 'ds1',
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
  dataSource: {
    id: 'ds1',
    tenantId: 't1',
    name: 'PostgreSQL Source',
    type: 'POSTGRESQL',
    config: {},
    status: 'active',
    syncFrequency: 'daily',
    lastSyncAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    syncRuns: [],
  },
};

describe('PipelineCard', () => {
  it('renders pipeline information', () => {
    render(<PipelineCard pipeline={mockPipeline} />);

    expect(screen.getByText('ETL Pipeline')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('Extract and transform data')).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<PipelineCard pipeline={mockPipeline} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
