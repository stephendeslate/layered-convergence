// Map loading state
import { Skeleton } from '../../../../components/ui/skeleton';

export default function MapLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}
