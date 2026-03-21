export default function CreateDashboardLoading() {
  return (
    <div className="space-y-4 max-w-lg" role="status" aria-busy="true" aria-label="Loading create dashboard form">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="space-y-3">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
