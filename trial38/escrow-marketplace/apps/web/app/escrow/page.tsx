import { formatCurrency } from '@escrow-marketplace/shared';

// TRACED: EM-FE-014 — Escrow accounts page

export default function EscrowPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Escrow Accounts</h1>
      <p className="text-muted-foreground">
        Funds held in escrow for active transactions are displayed here.
        All amounts in {formatCurrency(0).replace('0.00', 'USD')}.
      </p>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Transaction
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Amount Held
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={3}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Sign in to view escrow accounts.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
