// TRACED:AE-FE-07 — Events page with table display
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const mockEvents = [
  { id: '1', type: 'PAGE_VIEW', name: 'Homepage Visit', createdAt: '2024-01-15T10:30:00Z' },
  { id: '2', type: 'CLICK', name: 'CTA Button', createdAt: '2024-01-15T10:31:00Z' },
  { id: '3', type: 'CONVERSION', name: 'Signup', createdAt: '2024-01-15T10:32:00Z' },
  { id: '4', type: 'CUSTOM', name: 'Error Tracked', createdAt: '2024-01-15T10:33:00Z' },
];

const typeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PAGE_VIEW: 'default',
  CLICK: 'secondary',
  CONVERSION: 'outline',
  CUSTOM: 'destructive',
};

export default function EventsPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Events</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>
                    <Badge variant={typeVariant[event.type] || 'default'}>
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--muted-foreground)]">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
