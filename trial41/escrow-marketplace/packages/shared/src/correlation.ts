// TRACED:EM-MON-01 correlation ID generation
import { randomUUID } from 'crypto';

export function generateCorrelationId(): string {
  return randomUUID();
}

// TRACED:EM-MON-01-ALIAS createCorrelationId alias for cross-project consistency
export const createCorrelationId = generateCorrelationId;
