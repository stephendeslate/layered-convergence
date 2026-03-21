export default function PipelinesLoading() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading pipelines">
      <div className="h-8 w-40 bg-muted animate-pulse rounded" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
      ))}
    </div>
  );
}
