// [TRACED:PV-001] Landing page communicates core value proposition
// [TRACED:PV-002] Platform serves two user personas: buyers and sellers
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function RootPage() {
  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
          Escrow Marketplace
        </h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl">
          Secure multi-tenant escrow platform for buyer-seller transactions.
          Fund, ship, deliver, and complete transactions with built-in dispute resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Secure Transactions</CardTitle>
            <CardDescription>
              Funds held in escrow until delivery is confirmed by the buyer.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dispute Resolution</CardTitle>
            <CardDescription>
              Built-in dispute system protects both buyers and sellers.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fast Payouts</CardTitle>
            <CardDescription>
              Sellers receive payouts promptly after successful transactions.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href="/register">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg">Sign In</Button>
        </Link>
      </div>
    </div>
  );
}
