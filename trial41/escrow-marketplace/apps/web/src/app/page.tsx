// TRACED:EM-UI-07 home page with dynamic import for bundle optimization
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const DashboardStats = dynamic(() => import('@/components/dashboard-stats'), {
  loading: () => <div role="status" aria-busy="true">Loading stats...</div>,
});

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome to Escrow Marketplace</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Listings</CardTitle>
            <CardDescription>Browse available items</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Track your purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Secure</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Escrows</CardTitle>
            <CardDescription>Funds held safely</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Protected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Disputes</CardTitle>
            <CardDescription>Resolution center</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Fair</p>
          </CardContent>
        </Card>
      </div>
      <DashboardStats />
    </div>
  );
}
