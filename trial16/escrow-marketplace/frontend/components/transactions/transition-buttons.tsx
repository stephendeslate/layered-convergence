'use client';

import { transitionTransaction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import type { TransactionStatus } from '@/lib/types';

interface TransitionButtonsProps {
  transactionId: string;
  currentStatus: TransactionStatus;
  userRole: string;
  isBuyer: boolean;
  isSeller: boolean;
}

interface AvailableTransition {
  targetStatus: TransactionStatus;
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
}

function getAvailableTransitions(
  currentStatus: TransactionStatus,
  userRole: string,
  isBuyer: boolean,
  isSeller: boolean,
): AvailableTransition[] {
  const transitions: AvailableTransition[] = [];

  if (currentStatus === 'PENDING' && isBuyer) {
    transitions.push({ targetStatus: 'FUNDED', label: 'Fund Escrow', variant: 'default' });
  }

  if (currentStatus === 'PENDING' && (isBuyer || isSeller || userRole === 'ADMIN')) {
    transitions.push({ targetStatus: 'CANCELLED', label: 'Cancel', variant: 'destructive' });
  }

  if (currentStatus === 'FUNDED' && isSeller) {
    transitions.push({ targetStatus: 'SHIPPED', label: 'Mark Shipped', variant: 'default' });
  }

  if (currentStatus === 'FUNDED' && (isBuyer || isSeller)) {
    transitions.push({ targetStatus: 'DISPUTED', label: 'Open Dispute', variant: 'destructive' });
  }

  if (currentStatus === 'FUNDED' && (isSeller || userRole === 'ADMIN')) {
    transitions.push({ targetStatus: 'CANCELLED', label: 'Cancel', variant: 'destructive' });
  }

  if (currentStatus === 'SHIPPED' && isBuyer) {
    transitions.push({ targetStatus: 'DELIVERED', label: 'Confirm Delivery', variant: 'default' });
  }

  if (currentStatus === 'SHIPPED' && (isBuyer || isSeller)) {
    transitions.push({ targetStatus: 'DISPUTED', label: 'Open Dispute', variant: 'destructive' });
  }

  if (currentStatus === 'DELIVERED' && (isBuyer || userRole === 'ADMIN')) {
    transitions.push({ targetStatus: 'RELEASED', label: 'Release Funds', variant: 'default' });
  }

  if (currentStatus === 'DELIVERED' && (isBuyer || isSeller)) {
    transitions.push({ targetStatus: 'DISPUTED', label: 'Open Dispute', variant: 'destructive' });
  }

  if (currentStatus === 'DISPUTED' && userRole === 'ADMIN') {
    transitions.push({ targetStatus: 'RESOLVED', label: 'Resolve Dispute', variant: 'default' });
  }

  if (currentStatus === 'RESOLVED' && userRole === 'ADMIN') {
    transitions.push({ targetStatus: 'RELEASED', label: 'Release Funds', variant: 'default' });
    transitions.push({ targetStatus: 'REFUNDED', label: 'Issue Refund', variant: 'destructive' });
  }

  return transitions;
}

export function TransitionButtons({
  transactionId,
  currentStatus,
  userRole,
  isBuyer,
  isSeller,
}: TransitionButtonsProps) {
  const transitions = getAvailableTransitions(
    currentStatus,
    userRole,
    isBuyer,
    isSeller,
  );

  if (transitions.length === 0) {
    return (
      <p className="text-sm text-gray-500" data-testid="no-actions">
        No actions available for this transaction.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" data-testid="transition-buttons">
      {transitions.map((t) => (
        <form key={t.targetStatus} action={transitionTransaction}>
          <input type="hidden" name="transactionId" value={transactionId} />
          <input type="hidden" name="targetStatus" value={t.targetStatus} />
          <Button
            type="submit"
            variant={t.variant}
            aria-label={`${t.label} for transaction`}
            data-testid={`transition-${t.targetStatus.toLowerCase()}`}
          >
            {t.label}
          </Button>
        </form>
      ))}
    </div>
  );
}
