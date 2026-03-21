import { Suspense } from "react";
import { fetchDisputes } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Dispute } from "@/lib/types";
import { formatDate, getStatusColor } from "@/lib/utils";
import Link from "next/link";

async function DisputeList() {
  const disputes: Dispute[] = await fetchDisputes();

  if (disputes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-sm text-gray-500">No disputes found</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Filed By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Resolution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((dispute) => (
              <TableRow key={dispute.id}>
                <TableCell>
                  <Link
                    href={`/transactions/${dispute.transactionId}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {dispute.transaction?.title ?? dispute.transactionId}
                  </Link>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="truncate text-sm">{dispute.reason}</p>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(dispute.status)}>
                    {dispute.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {dispute.filedByUser?.name ?? "Unknown"}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(dispute.createdAt)}
                </TableCell>
                <TableCell className="max-w-xs text-sm text-gray-600">
                  {dispute.resolution ? (
                    <p className="truncate">{dispute.resolution}</p>
                  ) : (
                    <span className="text-gray-400">Pending</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Disputes
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage transaction disputes
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
        <DisputeList />
      </Suspense>
    </div>
  );
}
