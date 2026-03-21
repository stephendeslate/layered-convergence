export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span className="sr-only">Loading dashboard...</span>
    </div>
  );
}
