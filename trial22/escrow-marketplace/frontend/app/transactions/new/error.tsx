// TRACED:UI-003 — error.tsx in every route with role="alert"

'use client';

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-12">
      <h2 className="text-xl font-semibold text-destructive">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  );
}
