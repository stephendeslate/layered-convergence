// [TRACED:EM-013] Error boundary with role=alert focus management
"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

// [TRACED:FE-004] Root error boundary with role="alert", useRef, useEffect focus
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
        Something went wrong
      </h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
