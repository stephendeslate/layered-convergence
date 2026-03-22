// TRACED: FD-CORRELATION-ID-SHARED
import { randomUUID } from 'crypto';

export function createCorrelationId(): string {
  return randomUUID();
}
