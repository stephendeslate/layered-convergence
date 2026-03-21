export default function RegisterLoading() {
  return (
    <div className="max-w-md mx-auto space-y-4" role="status" aria-busy="true" aria-label="Loading registration form">
      <div className="h-8 w-32 bg-muted animate-pulse rounded mx-auto" />
      <div className="space-y-3">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
