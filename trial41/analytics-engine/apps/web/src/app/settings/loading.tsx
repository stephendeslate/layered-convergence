import { Skeleton } from '../../../components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
