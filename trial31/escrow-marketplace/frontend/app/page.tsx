import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Escrow Marketplace</h1>
      <p className="text-[var(--muted-foreground)] mb-8 max-w-2xl">
        Secure escrow payment platform for buyers and sellers. Create
        transactions, manage disputes, and track payouts with confidence.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)] mb-4">
              Create and manage escrow transactions between buyers and sellers.
            </p>
            <Button asChild>
              <Link href="/transactions">View Transactions</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)] mb-4">
              File and resolve disputes with arbiter mediation.
            </p>
            <Button asChild variant="secondary">
              <Link href="/disputes">View Disputes</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)] mb-4">
              Create an account as a buyer, seller, or arbiter.
            </p>
            <Button asChild variant="outline">
              <Link href="/register">Register</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
