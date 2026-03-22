import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
  secondary: 'bg-[var(--muted)] text-[var(--foreground)]',
  destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
  outline: 'border border-[var(--border)] text-[var(--foreground)]',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
