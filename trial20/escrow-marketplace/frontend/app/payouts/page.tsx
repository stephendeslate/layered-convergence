import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreatePayoutDialog } from './create-payout-dialog';
import type { Payout } from '@/lib/types';

const API_URL = process.env.API_URL || 'http://localhost:3001';

function getPayoutStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'COMPLETED':
      return 'default';
    case 'FAILED':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default async function PayoutsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const userCookie = cookieStore.get('user')?.value;
  let currentUser: { role: string } | null = null;
  if (userCookie) {
    try {
      currentUser = JSON.parse(userCookie);
    } catch {
      currentUser = null;
    }
  }

  const response = await fetch(`${API_URL}/payouts`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  let payouts: Payout[] = [];
  if (response.ok) {
    payouts = await response.json();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payouts</h1>
        {currentUser?.role === 'SELLER' && <CreatePayoutDialog />}
      </div>

      {payouts.length === 0 ? (
        <p className="text-muted-foreground">No payouts found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell className="font-medium">
                  {payout.transaction?.description ?? payout.transactionId}
                </TableCell>
                <TableCell>${payout.amount}</TableCell>
                <TableCell>
                  <Badge variant={getPayoutStatusVariant(payout.status)}>
                    {payout.status}
                  </Badge>
                </TableCell>
                <TableCell>{payout.recipient?.email}</TableCell>
                <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
