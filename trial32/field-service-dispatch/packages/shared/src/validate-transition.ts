/**
 * Generic state machine transition validator.
 * Used by backend services to enforce valid state transitions.
 */
export function validateTransition<T extends string>(
  currentStatus: T,
  targetStatus: T,
  allowedTransitions: Record<T, T[]>,
): void {
  const allowed = allowedTransitions[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    throw new Error(
      `Invalid transition from ${currentStatus} to ${targetStatus}`,
    );
  }
}
