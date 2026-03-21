export default function LoginLoading() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]" role="status" aria-busy="true" aria-label="Loading login form">
      <div className="w-full max-w-md space-y-4">
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
