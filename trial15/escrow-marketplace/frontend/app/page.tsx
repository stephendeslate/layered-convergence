import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStatusCounts, fetchTransactions } from "@/lib/api";
import { TransactionCard } from "@/components/transactions/transaction-card";
import type { StatusCounts, Transaction } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";

async function StatusCountCards() {
  const counts: StatusCounts = await fetchStatusCounts();

  const statusEntries: { key: keyof StatusCounts; label: string }[] = [
    { key: "PENDING", label: "Pending" },
    { key: "FUNDED", label: "Funded" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "RELEASED", label: "Released" },
    { key: "DISPUTED", label: "Disputed" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
      {statusEntries.map(({ key, label }) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{counts[key]}</span>
              <span
                className={`inline-block h-2 w-2 rounded-full ${getStatusColor(key).split(" ")[0]}`}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function RecentTransactions() {
  const transactions: Transaction[] = await fetchTransactions();
  const recent = transactions.slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-sm text-gray-500">No transactions yet</p>
        <Link
          href="/transactions/create"
          className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          Create your first transaction
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recent.map((tx) => (
        <TransactionCard key={tx.id} transaction={tx} />
      ))}
    </div>
  );
}

function StatusCountSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-10 animate-pulse rounded bg-gray-200" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentTransactionsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your escrow transactions
        </p>
      </div>

      <section aria-label="Transaction status counts">
        <Suspense fallback={<StatusCountSkeleton />}>
          <StatusCountCards />
        </Suspense>
      </section>

      <section aria-label="Recent transactions">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Transactions
          </h2>
          <Link
            href="/transactions"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <Suspense fallback={<RecentTransactionsSkeleton />}>
          <RecentTransactions />
        </Suspense>
      </section>
    </div>
  );
}
