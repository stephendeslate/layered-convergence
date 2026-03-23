// TRACED: EM-UIA-001
import * as React from 'react';
import { cn } from '@/lib/utils';

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border border-[var(--border)] p-4 [&>h2]:font-medium [&>h2]:leading-none [&>h2]:tracking-tight [&>p]:text-sm [&>p]:text-[var(--muted-foreground)]',
        className,
      )}
      {...props}
    />
  ),
);
Alert.displayName = 'Alert';

export { Alert };
