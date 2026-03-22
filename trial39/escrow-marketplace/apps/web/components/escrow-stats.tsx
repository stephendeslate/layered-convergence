// TRACED: EM-FE-012 — Dynamic escrow stats component (bundle optimization)
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EscrowStatsProps {
  totalVolume: string;
  activeListings: number;
  completedTransactions: number;
}

export default function EscrowStats({
  totalVolume,
  activeListings,
  completedTransactions,
}: EscrowStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
            Total Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalVolume}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
            Active Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{activeListings.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
            Completed Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{completedTransactions.toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
