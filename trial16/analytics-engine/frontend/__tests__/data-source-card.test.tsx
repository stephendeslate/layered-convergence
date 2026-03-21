import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DataSourceCard } from '@/components/dashboard/data-source-card';
import type { DataSource } from '@/lib/types';

const mockDataSource: DataSource = {
  id: 'ds-1',
  tenantId: 'tenant-1',
  name: 'Production Database',
  type: 'POSTGRESQL',
  config: { host: 'localhost', port: 5432 },
  status: 'ACTIVE',
  lastSyncAt: '2026-03-20T10:00:00Z',
  createdAt: '2026-01-15T08:00:00Z',
  updatedAt: '2026-03-20T10:00:00Z',
};

describe('DataSourceCard', () => {
  it('should render data source name', () => {
    render(<DataSourceCard dataSource={mockDataSource} />);
    expect(screen.getByText('Production Database')).toBeInTheDocument();
  });

  it('should render data source type label', () => {
    render(<DataSourceCard dataSource={mockDataSource} />);
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('should render ACTIVE status badge', () => {
    render(<DataSourceCard dataSource={mockDataSource} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('should render last sync date when present', () => {
    render(<DataSourceCard dataSource={mockDataSource} />);
    expect(screen.getByText(/3\/20\/2026/)).toBeInTheDocument();
  });

  it('should show "Never" when lastSyncAt is null', () => {
    const noSync = { ...mockDataSource, lastSyncAt: null };
    render(<DataSourceCard dataSource={noSync} />);
    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('should render ERROR status badge', () => {
    const errorSource = { ...mockDataSource, status: 'ERROR' as const };
    render(<DataSourceCard dataSource={errorSource} />);
    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });

  it('should render INACTIVE status badge', () => {
    const inactive = { ...mockDataSource, status: 'INACTIVE' as const };
    render(<DataSourceCard dataSource={inactive} />);
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('should render MySQL type label', () => {
    const mysql = { ...mockDataSource, type: 'MYSQL' as const };
    render(<DataSourceCard dataSource={mysql} />);
    expect(screen.getByText('MySQL')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<DataSourceCard dataSource={mockDataSource} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
