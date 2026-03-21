// TRACED: AE-REQ-PIPE-001 — Loading state with role="status" and aria-busy
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center p-12">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
