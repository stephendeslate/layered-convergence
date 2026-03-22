import { cn } from '@/lib/utils';

// TRACED: EM-UI-007 — Skeleton component (shadcn/ui)

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
