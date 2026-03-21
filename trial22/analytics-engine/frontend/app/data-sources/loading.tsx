// [TRACED:UI-012] Data sources loading.tsx with role="status" and aria-busy="true"

export default function DataSourcesLoading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="sr-only">Loading data sources...</span>
    </div>
  );
}
