import { Skeleton } from '@/components/ui/skeleton';

export default function PipelinesLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
