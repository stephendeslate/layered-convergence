export default function RegisterLoading() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]" role="status" aria-busy="true" aria-label="Loading registration form">
      <div className="w-full max-w-md space-y-4">
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
