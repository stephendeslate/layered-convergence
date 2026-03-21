import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchTransaction, fetchCurrentUser, transitionTransaction, createDispute } from "@/lib/api";
import { TransactionTimeline } from "@/components/transactions/transaction-timeline";
import { StateIndicator } from "@/components/transactions/state-indicator";
import { DisputePanel } from "@/components/disputes/dispute-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Transaction, TransactionTransition, User } from "@/lib/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { revalidatePath } from "next/cache";

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

async function transitionAction(
  prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  "use server";

  const transactionId = formData.get("transactionId") as string;
  const action = formData.get("action") as TransactionTransition;

  try {
    await transitionTransaction(transactionId, action);
    revalidatePath(`/transactions/${transactionId}`);
    return { error: null, success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update transaction";
    return { error: message, success: false };
  }
}

async function disputeAction(
  prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  "use server";

  const transactionId = formData.get("transactionId") as string;
  const reason = formData.get("reason") as string;
  const evidence = formData.get("evidence") as string;

  try {
    await createDispute({ transactionId, reason, evidence });
    revalidatePath(`/transactions/${transactionId}`);
    return { error: null, success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to file dispute";
    return { error: message, success: false };
  }
}

async function TransactionDetail({ id }: { id: string }) {
  let transaction: Transaction;
  try {
    transaction = await fetchTransaction(id);
  } catch {
    notFound();
  }

  const user: User | null = await fetchCurrentUser();
  const userRole = user?.role ?? "BUYER";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/transactions"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to transactions
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {transaction.title}
          </h1>
        </div>
        <Badge className={getStatusColor(transaction.status)}>
          {transaction.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTimeline transaction={transaction} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {transaction.description}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">
                {formatCurrency(transaction.amount, transaction.currency)}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Buyer</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {transaction.buyer?.name ?? "Unknown"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Seller</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {transaction.seller?.name ?? "Unknown"}
                </dd>
              </div>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(transaction.createdAt)}
              </dd>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <StateIndicator
              transactionId={transaction.id}
              status={transaction.status}
              userRole={userRole}
              transitionAction={transitionAction}
            />
          </CardContent>
        </Card>
      </div>

      {transaction.status === "FUNDED" && userRole === "BUYER" && (
        <DisputePanel
          transactionId={transaction.id}
          submitAction={disputeAction}
        />
      )}
    </div>
  );
}

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-32 w-full animate-pulse rounded-lg bg-gray-100" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
      }
    >
      <TransactionDetail id={id} />
    </Suspense>
  );
}
