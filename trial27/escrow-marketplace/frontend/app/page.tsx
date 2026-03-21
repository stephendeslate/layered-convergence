import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">Escrow Marketplace</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Secure transaction escrow platform for buyers and sellers with
        dispute resolution and automated payouts.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View and manage your escrow transactions.</p>
            <Link href="/dashboard">
              <Button>View Transactions</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create an account to start trading securely.</p>
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
