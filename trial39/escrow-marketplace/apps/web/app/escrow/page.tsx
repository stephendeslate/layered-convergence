// TRACED: EM-FE-010 — Escrow accounts page
import { fetchEscrowAccounts } from '@/lib/api';
import { formatCurrency } from '@escrow-marketplace/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function EscrowPage() {
  const accounts = await fetchEscrowAccounts();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Escrow Accounts</h1>

      {accounts.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No escrow accounts found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account: { id: string; amount: string; transactionId: string; createdAt: string }) => (
            <Card key={account.id}>
              <CardHeader>
                <CardTitle className="text-base font-mono">
                  {account.id.slice(0, 8)}...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Amount</span>
                  <span className="font-semibold">{formatCurrency(account.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Transaction</span>
                  <span className="font-mono text-sm">{account.transactionId.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Created</span>
                  <span className="text-sm">{new Date(account.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
