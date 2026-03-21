import * as React from 'react';
import { cn } from '@/lib/utils';

function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarImage({ src, alt, className }: { src?: string | null; alt?: string; className?: string }) {
  if (!src) return null;
  return (
    <img src={src} alt={alt || ''} className={cn('aspect-square h-full w-full object-cover', className)} />
  );
}

function AvatarFallback({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
