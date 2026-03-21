import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const mockWebhooks = [
  { id: '1', url: 'https://api.marketco.com/webhooks/escrow', events: ['transaction.funded', 'transaction.released'], isActive: true },
  { id: '2', url: 'https://old.marketco.com/webhooks', events: ['transaction.funded'], isActive: false },
];

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Webhooks</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Events</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockWebhooks.map((w) => (
            <TableRow key={w.id}>
              <TableCell className="font-mono text-sm">{w.url}</TableCell>
              <TableCell>{w.events.join(', ')}</TableCell>
              <TableCell>
                <Badge variant={w.isActive ? 'default' : 'destructive'}>
                  {w.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
