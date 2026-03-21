import { describe, it, expect } from 'vitest';
import { statusLabel, priorityLabel, availabilityLabel, formatDate } from '@/lib/utils';

describe('statusLabel', () => {
  it('returns human-readable labels for all statuses', () => {
    expect(statusLabel('CREATED')).toBe('Created');
    expect(statusLabel('EN_ROUTE')).toBe('En Route');
    expect(statusLabel('IN_PROGRESS')).toBe('In Progress');
    expect(statusLabel('ON_HOLD')).toBe('On Hold');
    expect(statusLabel('CANCELLED')).toBe('Cancelled');
  });
});

describe('priorityLabel', () => {
  it('returns human-readable labels for all priorities', () => {
    expect(priorityLabel('LOW')).toBe('Low');
    expect(priorityLabel('MEDIUM')).toBe('Medium');
    expect(priorityLabel('HIGH')).toBe('High');
    expect(priorityLabel('URGENT')).toBe('Urgent');
  });
});

describe('availabilityLabel', () => {
  it('returns human-readable labels for all availability statuses', () => {
    expect(availabilityLabel('AVAILABLE')).toBe('Available');
    expect(availabilityLabel('BUSY')).toBe('Busy');
    expect(availabilityLabel('OFF_DUTY')).toBe('Off Duty');
    expect(availabilityLabel('ON_LEAVE')).toBe('On Leave');
  });
});

describe('formatDate', () => {
  it('returns em dash for null', () => {
    expect(formatDate(null)).toBe('\u2014');
  });

  it('formats a date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});
