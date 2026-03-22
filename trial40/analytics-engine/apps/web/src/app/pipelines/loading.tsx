import { Skeleton } from '@/components/ui/skeleton';

export default function PipelinesLoading(): React.ReactElement {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
