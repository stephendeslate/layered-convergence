'use client';

import { cn } from '@/lib/utils';
import type { TransactionStatus, DisputeStatus, PayoutStatus, OnboardingStatus } from '@cpm/shared';

type StatusType = TransactionStatus | DisputeStatus | PayoutStatus | OnboardingStatus | string;

// Use a Map to avoid duplicate key issues when enum values share the same string
const statusColors = new Map<string, string>([
  // Transaction statuses
  ['CREATED', 'bg-gray-100 text-gray-700 border-gray-200'],
  ['PAYMENT_HELD', 'bg-blue-100 text-blue-700 border-blue-200'],
  ['DELIVERED', 'bg-indigo-100 text-indigo-700 border-indigo-200'],
  ['RELEASED', 'bg-green-100 text-green-700 border-green-200'],
  ['PAID_OUT', 'bg-emerald-100 text-emerald-700 border-emerald-200'],
  ['DISPUTED', 'bg-red-100 text-red-700 border-red-200'],
  ['REFUNDED', 'bg-orange-100 text-orange-700 border-orange-200'],
  ['EXPIRED', 'bg-gray-100 text-gray-500 border-gray-200'],
  ['CANCELLED', 'bg-gray-100 text-gray-500 border-gray-200'],

  // Dispute statuses
  ['OPEN', 'bg-red-100 text-red-700 border-red-200'],
  ['UNDER_REVIEW', 'bg-yellow-100 text-yellow-700 border-yellow-200'],
  ['RESOLVED_RELEASED', 'bg-green-100 text-green-700 border-green-200'],
  ['RESOLVED_REFUNDED', 'bg-orange-100 text-orange-700 border-orange-200'],
  ['ESCALATED', 'bg-purple-100 text-purple-700 border-purple-200'],
  ['CLOSED', 'bg-gray-100 text-gray-500 border-gray-200'],

  // Payout statuses (PENDING, FAILED, CANCELLED already covered)
  ['IN_TRANSIT', 'bg-blue-100 text-blue-700 border-blue-200'],
  ['PAID', 'bg-green-100 text-green-700 border-green-200'],
  ['PENDING', 'bg-yellow-100 text-yellow-700 border-yellow-200'],
  ['FAILED', 'bg-red-100 text-red-700 border-red-200'],

  // Onboarding statuses
  ['NOT_STARTED', 'bg-gray-100 text-gray-500 border-gray-200'],
  ['COMPLETE', 'bg-green-100 text-green-700 border-green-200'],
  ['RESTRICTED', 'bg-red-100 text-red-700 border-red-200'],

  // Webhook statuses
  ['RECEIVED', 'bg-gray-100 text-gray-700 border-gray-200'],
  ['PROCESSING', 'bg-blue-100 text-blue-700 border-blue-200'],
  ['PROCESSED', 'bg-green-100 text-green-700 border-green-200'],
  ['SKIPPED', 'bg-gray-100 text-gray-500 border-gray-200'],

  // Roles
  ['BUYER', 'bg-blue-100 text-blue-700 border-blue-200'],
  ['PROVIDER', 'bg-green-100 text-green-700 border-green-200'],
  ['ADMIN', 'bg-purple-100 text-purple-700 border-purple-200'],
]);

const statusLabels: Record<string, string> = {
  PAYMENT_HELD: 'Payment Held',
  PAID_OUT: 'Paid Out',
  UNDER_REVIEW: 'Under Review',
  RESOLVED_RELEASED: 'Released',
  RESOLVED_REFUNDED: 'Refunded',
  IN_TRANSIT: 'In Transit',
  NOT_STARTED: 'Not Started',
  NOT_DELIVERED: 'Not Delivered',
  NOT_AS_DESCRIBED: 'Not As Described',
  QUALITY_ISSUE: 'Quality Issue',
  LATE_DELIVERY: 'Late Delivery',
  COMMUNICATION_ISSUE: 'Communication Issue',
};

function formatStatus(status: string): string {
  if (statusLabels[status]) return statusLabels[status];
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge({
  status,
  className,
}: {
  status: StatusType;
  className?: string;
}) {
  const colors = statusColors.get(status) || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colors,
        className,
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
