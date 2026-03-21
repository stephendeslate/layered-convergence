import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EmbedConfig } from '@/lib/types';

const mockEmbed: EmbedConfig = {
  id: 'emb-1',
  tenantId: 'tenant-1',
  dashboardId: 'db-1',
  dashboard: {
    id: 'db-1',
    tenantId: 'tenant-1',
    name: 'Sales Dashboard',
    description: null,
    isPublic: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  token: 'abc-123-def-456',
  allowedOrigins: ['https://example.com', 'https://app.example.com'],
  isActive: true,
  expiresAt: '2026-12-31T23:59:59Z',
  createdAt: '2026-03-01T08:00:00Z',
  updatedAt: '2026-03-01T08:00:00Z',
};

function EmbedConfigCard({ embed }: { embed: EmbedConfig }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{embed.dashboard?.name ?? 'Dashboard'}</CardTitle>
          <Badge variant={embed.isActive ? 'success' : 'secondary'}>
            {embed.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Token</dt>
            <dd className="font-mono text-xs" data-testid="embed-token">
              {embed.token}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Allowed Origins</dt>
            <dd>{embed.allowedOrigins.join(', ')}</dd>
          </div>
          {embed.expiresAt && (
            <div>
              <dt className="text-muted-foreground">Expires</dt>
              <dd>{new Date(embed.expiresAt).toLocaleDateString()}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

describe('EmbedConfigCard', () => {
  it('should render dashboard name', () => {
    render(<EmbedConfigCard embed={mockEmbed} />);
    expect(screen.getByText('Sales Dashboard')).toBeInTheDocument();
  });

  it('should render embed token', () => {
    render(<EmbedConfigCard embed={mockEmbed} />);
    expect(screen.getByTestId('embed-token')).toHaveTextContent('abc-123-def-456');
  });

  it('should render allowed origins', () => {
    render(<EmbedConfigCard embed={mockEmbed} />);
    expect(screen.getByText('https://example.com, https://app.example.com')).toBeInTheDocument();
  });

  it('should show Active badge when active', () => {
    render(<EmbedConfigCard embed={mockEmbed} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should show Inactive badge when inactive', () => {
    const inactive = { ...mockEmbed, isActive: false };
    render(<EmbedConfigCard embed={inactive} />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should render expiration date when present', () => {
    render(<EmbedConfigCard embed={mockEmbed} />);
    expect(screen.getByText(/12\/31\/2026/)).toBeInTheDocument();
  });

  it('should not render expiration when null', () => {
    const noExpiry = { ...mockEmbed, expiresAt: null };
    render(<EmbedConfigCard embed={noExpiry} />);
    expect(screen.queryByText('Expires')).not.toBeInTheDocument();
  });

  it('should fall back to "Dashboard" when dashboard is undefined', () => {
    const noDash = { ...mockEmbed, dashboard: undefined };
    render(<EmbedConfigCard embed={noDash} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<EmbedConfigCard embed={mockEmbed} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
