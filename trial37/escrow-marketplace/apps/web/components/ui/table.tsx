import { forwardRef, type TableHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="w-full overflow-auto">
        <table
          ref={ref}
          className={cn(
            'w-full caption-bottom text-sm border-collapse',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Table.displayName = 'Table';

export { Table };
