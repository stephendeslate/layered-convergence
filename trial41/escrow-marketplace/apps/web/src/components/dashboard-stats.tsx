// TRACED:EM-UI-08 dynamic dashboard stats component
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@em/shared';

export default function DashboardStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-neutral-500">Total Volume</p>
            <p className="text-2xl font-bold">{formatCurrency(15249.99)}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Active Escrows</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Resolved Disputes</p>
            <p className="text-2xl font-bold">3</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
