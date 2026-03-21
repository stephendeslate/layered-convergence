import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Escrow Marketplace</h1>
      <p className="text-[var(--muted-foreground)]">Multi-tenant escrow-based payment platform</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Manage escrow transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/transactions" className="text-sm hover:underline">View transactions</a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disputes</CardTitle>
            <CardDescription>Handle transaction disputes</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/disputes" className="text-sm hover:underline">View disputes</a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payouts</CardTitle>
            <CardDescription>Track payment releases</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/payouts" className="text-sm hover:underline">View payouts</a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>Configure event notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/webhooks" className="text-sm hover:underline">View webhooks</a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
