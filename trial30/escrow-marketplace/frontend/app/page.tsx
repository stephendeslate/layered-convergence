import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Escrow Marketplace</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Secure escrow payment platform for buyer-seller transactions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View and manage escrow transactions with secure fund holding.</p>
            <Link href="/transactions">
              <Button>View Transactions</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">File and resolve disputes with arbiter-mediated resolution.</p>
            <Link href="/disputes">
              <Button variant="outline">View Disputes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
