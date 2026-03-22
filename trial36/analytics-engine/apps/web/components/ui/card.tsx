import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

// TRACED: AE-UI-003
const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(className)}
      ref={ref}
      style={{
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
      }}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(className)}
      ref={ref}
      style={{ padding: '1.5rem 1.5rem 0' }}
      {...props}
    />
  ),
);
CardHeader.displayName = 'CardHeader';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(className)}
      ref={ref}
      style={{ padding: '1.5rem' }}
      {...props}
    />
  ),
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(className)}
      ref={ref}
      style={{ padding: '0 1.5rem 1.5rem', display: 'flex', alignItems: 'center' }}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
