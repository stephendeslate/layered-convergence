import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)] mb-4">
              View and manage your escrow transactions.
            </p>
            <Link href="/transactions">
              <Button variant="outline" size="sm">View Transactions</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)] mb-4">
              Manage open disputes and resolutions.
            </p>
            <Link href="/disputes">
              <Button variant="outline" size="sm">View Disputes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)] mb-4">
              Track payout status and request new payouts.
            </p>
            <Link href="/payouts">
              <Button variant="outline" size="sm">View Payouts</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
