"use client";

import { useEffect, useRef } from "react";

export default function RegisterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="alert" className="mx-auto max-w-md py-12 text-center">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mb-4 text-2xl font-bold text-[var(--destructive)] outline-none"
      >
        Registration Error
      </h2>
      <p className="mb-6 text-[var(--muted-foreground)]">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-[var(--primary-foreground)] hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
