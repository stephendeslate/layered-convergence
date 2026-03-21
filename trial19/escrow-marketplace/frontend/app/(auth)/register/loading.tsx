import { FormSkeleton } from '@/components/loading-skeleton';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <FormSkeleton />
    </div>
  );
}
