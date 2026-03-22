// TRACED: EM-WLOGL-001
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton className="h-8 w-32 mb-4 mx-auto" />
      <Skeleton className="h-48 w-full max-w-md mx-auto" />
    </div>
  );
}
