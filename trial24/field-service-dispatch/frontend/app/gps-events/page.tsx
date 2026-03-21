// [TRACED:UI-018] GPS Events list page with event type and coordinates

'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface GpsEvent {
  id: string;
  eventType: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  technician?: { name: string };
}

export default function GpsEventsPage() {
  const [events, setEvents] = useState<GpsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await apiFetch('/gps-events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) {
    return <p className="text-[var(--muted-foreground)]">Loading GPS events...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">GPS Events</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent GPS Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No GPS events found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Badge variant="outline">{event.eventType}</Badge>
                    </TableCell>
                    <TableCell>{event.technician?.name ?? '—'}</TableCell>
                    <TableCell>{event.latitude.toFixed(6)}</TableCell>
                    <TableCell>{event.longitude.toFixed(6)}</TableCell>
                    <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
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
