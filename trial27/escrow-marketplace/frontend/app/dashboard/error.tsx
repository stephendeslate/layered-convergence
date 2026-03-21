"use client";

import { useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";

export default function DashboardError({
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
    <div role="alert" className="flex flex-col items-center justify-center min-h-[50vh] px-6">
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold mb-4 outline-none">
        Transaction Error
      </h2>
      <p className="text-[var(--muted-foreground)] mb-6">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
