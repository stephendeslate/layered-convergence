import { Skeleton } from '../../../../components/ui/skeleton';

// TRACED: EM-AX-LOADING-004 — Settings loading with role="status" + aria-busy
export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" className="container mx-auto px-6 py-8">
      <Skeleton className="h-10 w-48 mb-6" />
      <Skeleton className="h-64 w-full max-w-lg rounded-lg" />
      <span className="sr-only">Loading settings...</span>
    </div>
  );
}
