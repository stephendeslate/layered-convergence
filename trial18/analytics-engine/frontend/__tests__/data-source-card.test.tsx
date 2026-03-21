import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DataSourceCard } from '@/components/dashboard/data-source-card';
import type { DataSource } from '@/lib/types';

const mockDataSource: DataSource = {
  id: 'ds1',
  tenantId: 't1',
  name: 'Production DB',
  type: 'POSTGRESQL',
  config: {},
  status: 'active',
  syncFrequency: 'hourly',
  lastSyncAt: '2026-01-15T10:00:00Z',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  syncRuns: [],
};

describe('DataSourceCard', () => {
  it('renders data source information', () => {
    render(<DataSourceCard dataSource={mockDataSource} />);

    expect(screen.getByText('Production DB')).toBeInTheDocument();
    expect(screen.getByText('POSTGRESQL')).toBeInTheDocument();
    expect(screen.getByText('Status: active')).toBeInTheDocument();
    expect(screen.getByText('Sync: hourly')).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<DataSourceCard dataSource={mockDataSource} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
