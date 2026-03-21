// TRACED:UI-002 — loading.tsx in every route with role="status" and aria-busy="true"

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex justify-center py-12">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}
