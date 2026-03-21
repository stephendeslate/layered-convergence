import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <h1 className="text-4xl font-bold tracking-tight">
        Escrow Marketplace
      </h1>
      <p className="max-w-2xl text-center text-lg text-muted-foreground">
        Secure peer-to-peer transactions with built-in escrow protection.
        Buy and sell with confidence knowing your funds are protected until
        delivery is confirmed.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Secure Escrow</CardTitle>
            <CardDescription>
              Funds held safely until delivery confirmation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your payment is protected in escrow until you confirm receipt
              of goods, eliminating fraud risk.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dispute Resolution</CardTitle>
            <CardDescription>
              Fair process for contested transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If something goes wrong, our structured dispute process ensures
              a fair outcome for both parties.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transparent Tracking</CardTitle>
            <CardDescription>
              Follow every step of your transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Real-time status updates keep you informed from funding through
              delivery and completion.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href="/register">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
