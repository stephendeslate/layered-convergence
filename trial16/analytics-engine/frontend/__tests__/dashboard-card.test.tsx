import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Dashboard } from '@/lib/types';

const mockDashboard: Dashboard = {
  id: 'db-1',
  tenantId: 'tenant-1',
  name: 'Sales Dashboard',
  description: 'Revenue and sales metrics',
  isPublic: false,
  createdAt: '2026-01-15T08:00:00Z',
  updatedAt: '2026-03-20T10:00:00Z',
  _count: { widgets: 5 },
};

function DashboardCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{dashboard.name}</CardTitle>
          {dashboard.isPublic && <Badge variant="secondary">Public</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {dashboard.description && (
          <p className="text-sm text-muted-foreground">
            {dashboard.description}
          </p>
        )}
        <p className="text-sm">{dashboard._count?.widgets ?? 0} widgets</p>
      </CardContent>
    </Card>
  );
}

describe('DashboardCard', () => {
  it('should render dashboard name', () => {
    render(<DashboardCard dashboard={mockDashboard} />);
    expect(screen.getByText('Sales Dashboard')).toBeInTheDocument();
  });

  it('should render dashboard description', () => {
    render(<DashboardCard dashboard={mockDashboard} />);
    expect(screen.getByText('Revenue and sales metrics')).toBeInTheDocument();
  });

  it('should render widget count', () => {
    render(<DashboardCard dashboard={mockDashboard} />);
    expect(screen.getByText('5 widgets')).toBeInTheDocument();
  });

  it('should not show Public badge for private dashboards', () => {
    render(<DashboardCard dashboard={mockDashboard} />);
    expect(screen.queryByText('Public')).not.toBeInTheDocument();
  });

  it('should show Public badge for public dashboards', () => {
    const publicDashboard = { ...mockDashboard, isPublic: true };
    render(<DashboardCard dashboard={publicDashboard} />);
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('should show 0 widgets when count is missing', () => {
    const noCount = { ...mockDashboard, _count: undefined };
    render(<DashboardCard dashboard={noCount} />);
    expect(screen.getByText('0 widgets')).toBeInTheDocument();
  });

  it('should not render description when null', () => {
    const noDesc = { ...mockDashboard, description: null };
    render(<DashboardCard dashboard={noDesc} />);
    expect(screen.queryByText('Revenue and sales metrics')).not.toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<DashboardCard dashboard={mockDashboard} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
