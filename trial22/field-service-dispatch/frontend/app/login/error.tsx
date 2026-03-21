'use client';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[var(--destructive)] mb-2">Something went wrong</h2>
        <p className="text-[var(--muted-foreground)] mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
