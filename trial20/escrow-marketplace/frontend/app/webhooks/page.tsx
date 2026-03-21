import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreateWebhookDialog } from './create-webhook-dialog';
import type { Webhook } from '@/lib/types';

const API_URL = process.env.API_URL || 'http://localhost:3001';

function getWebhookStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'SENT':
      return 'default';
    case 'FAILED':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default async function WebhooksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const response = await fetch(`${API_URL}/webhooks`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  let webhooks: Webhook[] = [];
  if (response.ok) {
    webhooks = await response.json();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <CreateWebhookDialog />
      </div>

      {webhooks.length === 0 ? (
        <p className="text-muted-foreground">No webhooks found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  {webhook.url}
                </TableCell>
                <TableCell>{webhook.event}</TableCell>
                <TableCell>
                  <Badge variant={getWebhookStatusVariant(webhook.status)}>
                    {webhook.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(webhook.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
