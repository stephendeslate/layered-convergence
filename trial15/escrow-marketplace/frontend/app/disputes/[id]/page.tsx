import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchDisputes, resolveDispute } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import type { Dispute, User } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { ResolveDisputeForm } from "./resolve-form";

interface DisputeDetailPageProps {
  params: Promise<{ id: string }>;
}

async function findDispute(id: string): Promise<Dispute | undefined> {
  const disputes = await fetchDisputes();
  return disputes.find((d) => d.id === id);
}

async function resolveAction(
  prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  "use server";

  const disputeId = formData.get("disputeId") as string;
  const resolution = formData.get("resolution") as string;
  const outcome = formData.get("outcome") as "RELEASE" | "REFUND";

  try {
    await resolveDispute(disputeId, { resolution, outcome });
    revalidatePath(`/disputes/${disputeId}`);
    return { error: null, success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to resolve dispute";
    return { error: message, success: false };
  }
}

async function DisputeDetail({ id }: { id: string }) {
  const dispute = await findDispute(id);

  if (!dispute) {
    notFound();
  }

  const user: User | null = await fetchCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/disputes"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to disputes
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Dispute Details
          </h1>
        </div>
        <Badge className={getStatusColor(dispute.status)}>
          {dispute.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dispute Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Reason</dt>
              <dd className="mt-1 text-sm text-gray-900">{dispute.reason}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Evidence</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                {dispute.evidence}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Filed By</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {dispute.filedByUser?.name ?? "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Filed On</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(dispute.createdAt)}
              </dd>
            </div>
            {dispute.resolution && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Resolution
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {dispute.resolution}
                </dd>
              </div>
            )}
            {dispute.resolvedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Resolved On
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(dispute.resolvedAt)}
                </dd>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <Link
                  href={`/transactions/${dispute.transactionId}`}
                  className="text-blue-600 hover:underline"
                >
                  {dispute.transaction?.title ?? "View Transaction"}
                </Link>
              </dd>
            </div>
            {dispute.transaction && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900">
                    {formatCurrency(
                      dispute.transaction.amount,
                      dispute.transaction.currency
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <Badge
                      className={getStatusColor(dispute.transaction.status)}
                    >
                      {dispute.transaction.status}
                    </Badge>
                  </dd>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdmin && dispute.status === "OPEN" && (
        <ResolveDisputeForm
          disputeId={dispute.id}
          resolveAction={resolveAction}
        />
      )}
    </div>
  );
}

export default async function DisputeDetailPage({
  params,
}: DisputeDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
      }
    >
      <DisputeDetail id={id} />
    </Suspense>
  );
}
