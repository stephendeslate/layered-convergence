'use client';

import { useEffect, useState } from 'react';
import { fetchEvents } from '@/app/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Event {
  id: string;
  type: string;
  status: string;
  source: string;
  createdAt: string;
  tenantId: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token') ?? '';
      const tenantId = localStorage.getItem('tenantId') ?? '';
      const result = await fetchEvents(token, tenantId);

      if ('error' in result) {
        setError(result.error);
      } else {
        setEvents(result.data ?? result);
      }
      setLoading(false);
    }

    void load();
  }, []);

  if (loading) {
    return <p>Loading events...</p>;
  }

  const statusVariant = (status: string) => {
    if (status === 'PROCESSED') return 'default' as const;
    if (status === 'FAILED') return 'destructive' as const;
    return 'secondary' as const;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-[var(--muted-foreground)]">View and manage tracked events</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.type}</TableCell>
              <TableCell>{event.source}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(event.status)}>{event.status}</Badge>
              </TableCell>
              <TableCell>{new Date(event.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {events.length === 0 && !error && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                No events found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
