import { Suspense } from "react";
import { fetchPayouts } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Payout } from "@/lib/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

async function PayoutTable() {
  const payouts: Payout[] = await fetchPayouts();

  if (payouts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-sm text-gray-500">No payouts yet</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payout ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stripe ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell className="font-mono text-sm">
                  {payout.id.slice(0, 8)}...
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(payout.amount, payout.currency)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payout.status)}>
                    {payout.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {payout.stripePayoutId ?? "-"}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(payout.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {payout.completedAt ? formatDate(payout.completedAt) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Payouts
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your payout history and status
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 w-full animate-pulse rounded bg-gray-100"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        }
      >
        <PayoutTable />
      </Suspense>
    </div>
  );
}
