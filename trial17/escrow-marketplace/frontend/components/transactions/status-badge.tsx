import type { TransactionStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<
  TransactionStatus,
  { color: string; bgColor: string; label: string }
> = {
  PENDING: { color: 'bg-yellow-500', bgColor: 'bg-yellow-50 text-yellow-800', label: 'Pending' },
  FUNDED: { color: 'bg-blue-500', bgColor: 'bg-blue-50 text-blue-800', label: 'Funded' },
  SHIPPED: { color: 'bg-indigo-500', bgColor: 'bg-indigo-50 text-indigo-800', label: 'Shipped' },
  DELIVERED: { color: 'bg-purple-500', bgColor: 'bg-purple-50 text-purple-800', label: 'Delivered' },
  RELEASED: { color: 'bg-green-500', bgColor: 'bg-green-50 text-green-800', label: 'Released' },
  CANCELLED: { color: 'bg-gray-500', bgColor: 'bg-gray-50 text-gray-800', label: 'Cancelled' },
  DISPUTED: { color: 'bg-red-500', bgColor: 'bg-red-50 text-red-800', label: 'Disputed' },
  RESOLVED: { color: 'bg-teal-500', bgColor: 'bg-teal-50 text-teal-800', label: 'Resolved' },
  REFUNDED: { color: 'bg-orange-500', bgColor: 'bg-orange-50 text-orange-800', label: 'Refunded' },
};

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50 text-gray-800',
    label: status,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.bgColor,
        className,
      )}
    >
      <span
        className={cn('h-2 w-2 rounded-full', config.color)}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
}
