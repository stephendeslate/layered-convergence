import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[60vh] items-center justify-center">
      <Skeleton className="h-80 w-full max-w-md" />
    </div>
  );
}
