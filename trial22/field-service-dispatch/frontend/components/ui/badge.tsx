// shadcn/ui component: Badge
import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'destructive';
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
  secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
  success: 'bg-green-600 text-white',
  destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
};

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const variantClass = variantStyles[variant] ?? variantStyles.default;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClass} ${className}`}
      {...props}
    />
  );
}
