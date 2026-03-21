export default function RegisterLoading() {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6">
        <div className="h-6 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
        <div className="space-y-4 pt-4">
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
