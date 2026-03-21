import { Suspense } from 'react';
import { fetchEmbeds } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function EmbedList() {
  const embeds = await fetchEmbeds();

  if (embeds.length === 0) {
    return <p className="text-muted-foreground">No embeds configured.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {embeds.map((e) => (
        <Card key={e.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Embed: {e.dashboard?.name ?? e.dashboardId}</CardTitle>
              <Badge variant={e.isActive ? 'default' : 'secondary'}>
                {e.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-mono break-all">Token: {e.token}</p>
            {e.expiresAt && (
              <p className="text-xs text-muted-foreground mt-1">Expires: {new Date(e.expiresAt).toLocaleString()}</p>
            )}
            {e.allowedOrigins.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Origins: {e.allowedOrigins.join(', ')}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function EmbedsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Embeds</h1>
      <Suspense fallback={<div aria-busy="true">Loading embeds...</div>}>
        <EmbedList />
      </Suspense>
    </div>
  );
}
