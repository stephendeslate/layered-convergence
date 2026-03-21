import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Escrow Marketplace</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Secure escrow payment platform for buyers and sellers. Fund transactions,
        manage disputes, and receive payouts with confidence.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-[var(--muted-foreground)]">
              New to the marketplace? Create your account as a buyer or seller.
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
              Already have an account? View your transactions.
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
