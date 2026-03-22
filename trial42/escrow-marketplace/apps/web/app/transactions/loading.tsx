// TRACED: EM-WTRXL-001
import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionsLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
