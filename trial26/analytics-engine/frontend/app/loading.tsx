// [TRACED:AE-040] Loading states use role="status" and aria-busy="true"
// [TRACED:AE-012] Loading state with role=status and aria-busy
// [TRACED:FE-003] Root loading state with role="status" and aria-busy
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
