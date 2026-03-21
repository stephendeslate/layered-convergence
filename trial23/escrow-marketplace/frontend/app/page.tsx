import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Escrow Marketplace</h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Secure peer-to-peer transactions with built-in escrow protection.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Secure Escrow</CardTitle>
            <CardDescription>Funds held safely until delivery confirmed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              Payments are held in escrow until the buyer confirms receipt,
              protecting both parties in every transaction.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dispute Resolution</CardTitle>
            <CardDescription>Fair process for both buyers and sellers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              If issues arise, our dispute workflow ensures fair resolution
              for all parties involved.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automatic Payouts</CardTitle>
            <CardDescription>Sellers receive funds on completion</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              Once delivery is confirmed and the transaction completes,
              payouts are processed automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
