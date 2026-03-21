import { cn } from '@/lib/utils';
import type { TransactionStatus } from '@/lib/types';

interface StateTimelineProps {
  currentStatus: TransactionStatus;
}

const HAPPY_PATH: TransactionStatus[] = [
  'PENDING',
  'FUNDED',
  'SHIPPED',
  'DELIVERED',
  'RELEASED',
];

const STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: 'Pending',
  FUNDED: 'Funded',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  RELEASED: 'Released',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
  RESOLVED: 'Resolved',
  REFUNDED: 'Refunded',
};

export function StateTimeline({ currentStatus }: StateTimelineProps) {
  const isAlternate = ['CANCELLED', 'DISPUTED', 'RESOLVED', 'REFUNDED'].includes(
    currentStatus,
  );

  const steps = isAlternate
    ? getAlternateSteps(currentStatus)
    : HAPPY_PATH;

  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="w-full" data-testid="state-timeline">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold',
                    isComplete && 'border-green-600 bg-green-600 text-white',
                    isCurrent && 'border-blue-600 bg-blue-600 text-white',
                    !isComplete && !isCurrent && 'border-gray-300 bg-white text-gray-400',
                  )}
                >
                  {isComplete ? '\u2713' : index + 1}
                </div>
                <span
                  className={cn(
                    'mt-1 text-xs',
                    isCurrent ? 'font-semibold text-blue-600' : 'text-gray-500',
                  )}
                >
                  {STATUS_LABELS[step]}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1',
                    index < currentIndex ? 'bg-green-600' : 'bg-gray-300',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getAlternateSteps(status: TransactionStatus): TransactionStatus[] {
  switch (status) {
    case 'CANCELLED':
      return ['PENDING', 'CANCELLED'];
    case 'DISPUTED':
      return ['PENDING', 'FUNDED', 'DISPUTED'];
    case 'RESOLVED':
      return ['PENDING', 'FUNDED', 'DISPUTED', 'RESOLVED'];
    case 'REFUNDED':
      return ['PENDING', 'FUNDED', 'DISPUTED', 'RESOLVED', 'REFUNDED'];
    default:
      return HAPPY_PATH;
  }
}
