// [TRACED:UI-017] Routes list page with status tracking

'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Route {
  id: string;
  name: string;
  status: string;
  estimatedDistance?: number;
  date: string;
  technician?: { name: string };
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const res = await apiFetch('/routes');
        if (res.ok) {
          const data = await res.json();
          setRoutes(data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchRoutes();
  }, []);

  if (loading) {
    return <p className="text-[var(--muted-foreground)]">Loading routes...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Routes</h1>
        <Button>Plan Route</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No routes found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Distance (mi)</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell>
                      <Badge variant={route.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {route.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{route.technician?.name ?? 'Unassigned'}</TableCell>
                    <TableCell>{route.estimatedDistance?.toFixed(1) ?? '—'}</TableCell>
                    <TableCell>{new Date(route.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
