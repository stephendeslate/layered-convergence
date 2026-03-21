// [TRACED:TS-004] Frontend tests with axe-core accessibility checks
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import HomePage from '../app/page';
import DashboardPage from '../app/dashboard/page';
import DataSourcesPage from '../app/data-sources/page';
import PipelinesPage from '../app/pipelines/page';
import WidgetsPage from '../app/widgets/page';
import EmbedsPage from '../app/embeds/page';
import SyncRunsPage from '../app/sync-runs/page';
import DataPointsPage from '../app/data-points/page';

async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container);
  const violations = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  return violations;
}

describe('HomePage', () => {
  it('renders the title', () => {
    render(<HomePage />);
    expect(screen.getByText('Analytics Engine')).toBeDefined();
  });

  it('has no critical accessibility violations', async () => {
    const { container } = render(<HomePage />);
    const violations = await checkA11y(container);
    expect(violations).toHaveLength(0);
  });
});

describe('DashboardPage', () => {
  it('renders the heading', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboards')).toBeDefined();
  });

  it('has no critical accessibility violations', async () => {
    const { container } = render(<DashboardPage />);
    const violations = await checkA11y(container);
    expect(violations).toHaveLength(0);
  });
});

describe('DataSourcesPage', () => {
  it('renders the heading', () => {
    render(<DataSourcesPage />);
    expect(screen.getByText('Data Sources')).toBeDefined();
  });

  it('has no critical accessibility violations', async () => {
    const { container } = render(<DataSourcesPage />);
    const violations = await checkA11y(container);
    expect(violations).toHaveLength(0);
  });
});

describe('PipelinesPage', () => {
  it('renders the heading', () => {
    render(<PipelinesPage />);
    expect(screen.getByText('Pipelines')).toBeDefined();
  });

  it('has no critical accessibility violations', async () => {
    const { container } = render(<PipelinesPage />);
    const violations = await checkA11y(container);
    expect(violations).toHaveLength(0);
  });
});

describe('WidgetsPage', () => {
  it('renders the heading', () => {
    render(<WidgetsPage />);
    expect(screen.getByText('Widgets')).toBeDefined();
  });

  it('has no critical accessibility violations', async () => {
    const { container } = render(<WidgetsPage />);
    const violations = await checkA11y(container);
    expect(violations).toHaveLength(0);
  });
});

describe('EmbedsPage', () => {
  it('renders the heading', () => {
    render(<EmbedsPage />);
    expect(screen.getByText('Embeds')).toBeDefined();
  });

  it('has no critical accessibility violations', async () => {
    const { container } = render(<EmbedsPage />);
    const violations = await checkA11y(container);
    expect(violations).toHaveLength(0);
  });
});

describe('SyncRunsPage', () => {
  it('renders the heading', () => {
    render(<SyncRunsPage />);
    expect(screen.getByText('Sync Runs')).toBeDefined();
  });

  it('has no critical accessibility violations', async () => {
    const { container } = render(<SyncRunsPage />);
    const violations = await checkA11y(container);
    expect(violations).toHaveLength(0);
  });
});

describe('DataPointsPage', () => {
  it('renders the heading', () => {
    render(<DataPointsPage />);
    expect(screen.getByText('Data Points')).toBeDefined();
  });

  it('has no critical accessibility violations', async () => {
    const { container } = render(<DataPointsPage />);
    const violations = await checkA11y(container);
    expect(violations).toHaveLength(0);
  });
});
