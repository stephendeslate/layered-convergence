/**
 * Validates whether a state transition is allowed given a set of allowed transitions.
 * Used by the backend service to enforce state machine rules.
 *
 * @param currentStatus - The current status of the entity
 * @param targetStatus - The desired target status
 * @param allowedTransitions - A record mapping each status to its allowed target statuses
 * @returns true if the transition is valid
 * @throws Error if the transition is not allowed
 */
export function validateTransition<T extends string>(
  currentStatus: T,
  targetStatus: T,
  allowedTransitions: Record<T, T[]>,
): boolean {
  const allowed = allowedTransitions[currentStatus];

  if (!allowed) {
    throw new Error(`Unknown status: ${currentStatus}`);
  }

  if (!allowed.includes(targetStatus)) {
    throw new Error(
      `Invalid transition from ${currentStatus} to ${targetStatus}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
    );
  }

  return true;
}
