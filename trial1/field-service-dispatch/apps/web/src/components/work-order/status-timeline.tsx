'use client';

import { WorkOrderStatus } from '@fsd/shared';
import { STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const TIMELINE_STEPS: WorkOrderStatus[] = [
  WorkOrderStatus.UNASSIGNED,
  WorkOrderStatus.ASSIGNED,
  WorkOrderStatus.EN_ROUTE,
  WorkOrderStatus.ON_SITE,
  WorkOrderStatus.IN_PROGRESS,
  WorkOrderStatus.COMPLETED,
];

const STEP_LABELS: Record<string, string> = {
  UNASSIGNED: 'Created',
  ASSIGNED: 'Assigned',
  EN_ROUTE: 'En Route',
  ON_SITE: 'On Site',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

interface StatusTimelineProps {
  currentStatus: WorkOrderStatus;
  history?: Array<{
    fromStatus: string;
    toStatus: string;
    createdAt: string;
    notes?: string;
  }>;
}

export function StatusTimeline({ currentStatus, history = [] }: StatusTimelineProps) {
  const currentIndex = TIMELINE_STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === WorkOrderStatus.CANCELLED;

  return (
    <div className="w-full">
      {/* Horizontal timeline for larger screens */}
      <div className="hidden sm:flex items-center justify-between">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex && !isCancelled;
          const isCurrent = step === currentStatus;
          const colors = STATUS_COLORS[step];

          const historyEntry = history.find(
            (h) => h.toStatus === step,
          );

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                    isCompleted
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : 'bg-gray-100 text-gray-400 border-gray-200',
                    isCurrent && 'ring-2 ring-offset-2 ring-blue-400',
                  )}
                >
                  {isCompleted && index < currentIndex ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1.5 font-medium',
                    isCompleted ? 'text-gray-900' : 'text-gray-400',
                  )}
                >
                  {STEP_LABELS[step]}
                </span>
                {historyEntry && (
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(historyEntry.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              {index < TIMELINE_STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    index < currentIndex && !isCancelled ? 'bg-blue-400' : 'bg-gray-200',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Vertical timeline for mobile */}
      <div className="sm:hidden space-y-3">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex && !isCancelled;
          const colors = STATUS_COLORS[step];

          return (
            <div key={step} className="flex items-center gap-3">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  isCompleted
                    ? `${colors.bg} ${colors.text}`
                    : 'bg-gray-100 text-gray-400',
                )}
              >
                {isCompleted ? (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn('text-sm', isCompleted ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm font-medium text-red-700">Work order has been cancelled</span>
        </div>
      )}
    </div>
  );
}
