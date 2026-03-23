import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" className="flex justify-center mt-20">
      <Skeleton className="h-80 w-full max-w-md" />
    </div>
  );
}
