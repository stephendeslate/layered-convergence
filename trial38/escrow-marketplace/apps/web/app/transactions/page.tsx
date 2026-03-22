import { formatCurrency } from '@escrow-marketplace/shared';

// TRACED: EM-FE-013 — Transactions page with shared utility usage

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      <p className="text-muted-foreground">
        View and manage your transaction history. All amounts shown in{' '}
        {formatCurrency(0).replace('0.00', 'USD')}.
      </p>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Listing
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Sign in to view your transactions.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
