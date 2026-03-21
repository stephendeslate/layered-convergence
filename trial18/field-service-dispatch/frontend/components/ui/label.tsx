import { cn } from '@/lib/utils';
import { type LabelHTMLAttributes, forwardRef } from 'react';

const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn('block text-sm font-medium text-gray-700', className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Label.displayName = 'Label';

export { Label };
