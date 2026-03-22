import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse rounded-md bg-gray-200',
          className,
        )}
        {...props}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
