import { Suspense } from "react";
import Link from "next/link";
import { fetchTransactions } from "@/lib/api";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { Button } from "@/components/ui/button";
import type { Transaction, TransactionStatus } from "@/lib/types";

interface TransactionsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "FUNDED", label: "Funded" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "RELEASED", label: "Released" },
  { value: "DISPUTED", label: "Disputed" },
  { value: "CANCELLED", label: "Cancelled" },
];

async function TransactionList({ status }: { status?: TransactionStatus }) {
  const transactions: Transaction[] = await fetchTransactions(status);

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-sm text-gray-500">
          No transactions found
          {status ? ` with status "${status}"` : ""}
        </p>
        <Link
          href="/transactions/create"
          className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          Create a new transaction
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {transactions.map((tx) => (
        <TransactionCard key={tx.id} transaction={tx} />
      ))}
    </div>
  );
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const currentStatus = params.status;
  const validStatus =
    currentStatus && currentStatus !== "ALL"
      ? (currentStatus as TransactionStatus)
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Transactions
        </h1>
        <Link href="/transactions/create">
          <Button>New Transaction</Button>
        </Link>
      </div>

      <nav
        className="flex flex-wrap gap-2"
        aria-label="Filter by status"
      >
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value === "ALL"
                ? "/transactions"
                : `/transactions?status=${tab.value}`
            }
          >
            <span
              className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                (currentStatus ?? "ALL") === tab.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        ))}
      </nav>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-lg border bg-gray-100"
              />
            ))}
          </div>
        }
      >
        <TransactionList status={validStatus} />
      </Suspense>
    </div>
  );
}
