export default function PipelineDetailLoading() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading pipeline details">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="h-48 bg-muted animate-pulse rounded-xl" />
    </div>
  );
}
