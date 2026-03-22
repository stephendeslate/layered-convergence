import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

// TRACED: AE-UI-008
const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table
        className={cn(className)}
        ref={ref}
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead className={cn(className)} ref={ref} {...props} />
  ),
);
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody className={cn(className)} ref={ref} {...props} />
  ),
);
TableBody.displayName = 'TableBody';

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      className={cn(className)}
      ref={ref}
      style={{ borderBottom: '1px solid var(--border)' }}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      className={cn(className)}
      ref={ref}
      style={{
        height: '3rem',
        padding: '0 1rem',
        textAlign: 'left',
        fontWeight: 500,
        color: 'var(--muted-foreground)',
      }}
      {...props}
    />
  ),
);
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, style, ...props }, ref) => (
    <td
      className={cn(className)}
      ref={ref}
      style={{ padding: '0.75rem 1rem', ...style }}
      {...props}
    />
  ),
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
