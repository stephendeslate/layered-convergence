import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[60vh] items-center justify-center">
      <Skeleton className="h-96 w-full max-w-md rounded-lg" />
    </div>
  );
}
