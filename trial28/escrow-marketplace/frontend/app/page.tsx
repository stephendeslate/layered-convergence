import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Escrow Marketplace</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Secure escrow payments for buyers and sellers. Funds are held safely
        until both parties confirm the transaction.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-[var(--muted-foreground)]">
              Create your account as a buyer, seller, or arbiter.
            </p>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-[var(--muted-foreground)]">
              Access your transactions and manage escrow payments.
            </p>
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
