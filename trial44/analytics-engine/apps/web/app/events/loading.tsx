import { Skeleton } from '@/components/ui/skeleton';

export default function EventsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
