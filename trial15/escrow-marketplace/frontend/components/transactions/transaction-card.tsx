import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  return (
    <Link href={`/transactions/${transaction.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold">
            {transaction.title}
          </CardTitle>
          <Badge className={getStatusColor(transaction.status)}>
            {transaction.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-gray-500 line-clamp-2">
            {transaction.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(transaction.amount, transaction.currency)}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(transaction.createdAt)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>
              Buyer: {transaction.buyer?.name ?? "Unknown"}
            </span>
            <span>
              Seller: {transaction.seller?.name ?? "Unknown"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
