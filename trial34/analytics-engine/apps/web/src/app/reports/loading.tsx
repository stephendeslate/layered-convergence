import { Skeleton } from '../../../../components/ui/skeleton';

// TRACED: AE-AX-LOADING-003 — Reports loading with role="status" + aria-busy
export default function ReportsLoading() {
  return (
    <div role="status" aria-busy="true" className="container mx-auto px-6 py-8">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
      <span className="sr-only">Loading reports...</span>
    </div>
  );
}
