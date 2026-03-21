'use client';

import { cn } from '@/lib/utils';
import type { TransactionStateHistoryDto } from '@cpm/shared';
import { AuditAction, TransactionStatus } from '@cpm/shared';

const actionIcons: Record<string, string> = {
  [AuditAction.TRANSACTION_CREATED]: '\u25CB',    // circle
  [AuditAction.PAYMENT_HELD]: '\u25C9',           // filled circle
  [AuditAction.DELIVERY_MARKED]: '\u2709',        // envelope
  [AuditAction.DELIVERY_CONFIRMED]: '\u2713',     // check
  [AuditAction.FUNDS_RELEASED]: '\u2191',         // up arrow
  [AuditAction.FUNDS_REFUNDED]: '\u21A9',         // return arrow
  [AuditAction.PAYOUT_INITIATED]: '\u2192',       // right arrow
  [AuditAction.PAYOUT_COMPLETED]: '\u2714',       // heavy check
  [AuditAction.PAYOUT_FAILED]: '\u2717',          // cross
  [AuditAction.DISPUTE_OPENED]: '\u26A0',         // warning
  [AuditAction.DISPUTE_EVIDENCE_ADDED]: '\u270E', // pencil
  [AuditAction.DISPUTE_RESOLVED]: '\u2714',       // heavy check
  [AuditAction.DISPUTE_ESCALATED]: '\u21C8',      // double up
  [AuditAction.HOLD_EXPIRED]: '\u23F0',           // clock
  [AuditAction.TRANSACTION_CANCELLED]: '\u2718',  // cross
  [AuditAction.AUTO_RELEASE_TRIGGERED]: '\u2B50', // star
};

const actionLabels: Record<string, string> = {
  [AuditAction.TRANSACTION_CREATED]: 'Transaction Created',
  [AuditAction.PAYMENT_HELD]: 'Payment Held',
  [AuditAction.DELIVERY_MARKED]: 'Delivery Marked',
  [AuditAction.DELIVERY_CONFIRMED]: 'Delivery Confirmed',
  [AuditAction.FUNDS_RELEASED]: 'Funds Released',
  [AuditAction.FUNDS_REFUNDED]: 'Funds Refunded',
  [AuditAction.PAYOUT_INITIATED]: 'Payout Initiated',
  [AuditAction.PAYOUT_COMPLETED]: 'Payout Completed',
  [AuditAction.PAYOUT_FAILED]: 'Payout Failed',
  [AuditAction.DISPUTE_OPENED]: 'Dispute Opened',
  [AuditAction.DISPUTE_EVIDENCE_ADDED]: 'Evidence Added',
  [AuditAction.DISPUTE_RESOLVED]: 'Dispute Resolved',
  [AuditAction.DISPUTE_ESCALATED]: 'Dispute Escalated',
  [AuditAction.HOLD_EXPIRED]: 'Hold Expired',
  [AuditAction.TRANSACTION_CANCELLED]: 'Transaction Cancelled',
  [AuditAction.AUTO_RELEASE_TRIGGERED]: 'Auto-Release Triggered',
};

function getNodeColor(toStatus: TransactionStatus): string {
  switch (toStatus) {
    case TransactionStatus.CREATED:
      return 'bg-gray-400 border-gray-500';
    case TransactionStatus.PAYMENT_HELD:
    case TransactionStatus.DELIVERED:
      return 'bg-blue-500 border-blue-600';
    case TransactionStatus.RELEASED:
    case TransactionStatus.PAID_OUT:
      return 'bg-green-500 border-green-600';
    case TransactionStatus.DISPUTED:
    case TransactionStatus.REFUNDED:
      return 'bg-red-500 border-red-600';
    case TransactionStatus.EXPIRED:
    case TransactionStatus.CANCELLED:
      return 'bg-gray-400 border-gray-500';
    default:
      return 'bg-gray-400 border-gray-500';
  }
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function TransactionTimeline({
  history,
  className,
}: {
  history: TransactionStateHistoryDto[];
  className?: string;
}) {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (sortedHistory.length === 0) {
    return (
      <div className={cn('text-sm text-gray-500', className)}>
        No state history available.
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {sortedHistory.map((entry, index) => {
          const isLast = index === sortedHistory.length - 1;
          const nodeColor = getNodeColor(entry.toStatus);

          return (
            <div key={entry.id} className="relative flex items-start gap-4 pl-0">
              {/* Node */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-white text-sm',
                  nodeColor,
                  isLast && 'ring-2 ring-offset-2 ring-blue-300',
                )}
              >
                {actionIcons[entry.action] || '\u25CF'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <p className="text-sm font-medium text-gray-900">
                    {actionLabels[entry.action] || entry.action}
                  </p>
                  <time className="text-xs text-gray-500">
                    {formatTimestamp(entry.createdAt)}
                  </time>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  {entry.fromStatus && (
                    <>
                      <span className="font-mono">{entry.fromStatus}</span>
                      <span>\u2192</span>
                    </>
                  )}
                  <span className="font-mono font-medium text-gray-700">
                    {entry.toStatus}
                  </span>
                </div>
                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    {JSON.stringify(entry.metadata)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
