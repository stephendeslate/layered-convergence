import { v4 as uuidv4 } from 'uuid';

// TRACED:AE-MON-001
export function createCorrelationId(): string {
  return uuidv4();
}
