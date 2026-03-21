"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

// [TRACED:FE-009] Login error boundary
export default function LoginError({
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
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold">Login Error</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
