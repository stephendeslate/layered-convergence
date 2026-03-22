// TRACED: AE-FE-05
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
  destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90',
  outline: 'border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]',
  ghost: 'bg-transparent hover:bg-[var(--muted)]',
};

const sizeStyles: Record<string, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-sm',
  lg: 'h-12 px-6 text-lg',
};

export function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if (asChild && typeof children === 'object' && children !== null) {
    return <>{children}</>;
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
