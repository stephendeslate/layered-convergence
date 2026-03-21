import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, getStatusColor } from "@/lib/utils";
import type { Dispute } from "@/lib/types";

interface DisputeCardProps {
  dispute: Dispute;
}

export function DisputeCard({ dispute }: DisputeCardProps) {
  return (
    <Link href={`/disputes/${dispute.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-base">
            Dispute for: {dispute.transaction?.title ?? "Transaction"}
          </CardTitle>
          <Badge className={getStatusColor(dispute.status)}>
            {dispute.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm text-gray-600 line-clamp-2">
            {dispute.reason}
          </p>
          <p className="text-xs text-gray-500">
            Filed by: {dispute.filedByUser?.name ?? "Unknown"}
          </p>
        </CardContent>
        <CardFooter className="justify-between text-xs text-gray-500">
          <span>Filed: {formatDate(dispute.createdAt)}</span>
          {dispute.resolvedAt && (
            <span>Resolved: {formatDate(dispute.resolvedAt)}</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
