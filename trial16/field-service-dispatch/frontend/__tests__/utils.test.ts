import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDistance, formatDuration, statusLabel, priorityLabel } from '@/lib/utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8');
  });

  it('should handle undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('should handle empty call', () => {
    expect(cn()).toBe('');
  });
});

describe('formatDate', () => {
  it('should return N/A for null', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  it('should format a valid date string', () => {
    const result = formatDate('2026-03-20T10:00:00Z');
    expect(result).toContain('2026');
    expect(result).toContain('Mar');
  });

  it('should include time in format', () => {
    const result = formatDate('2026-06-15T14:30:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });
});

describe('formatDistance', () => {
  it('should format km distances', () => {
    expect(formatDistance(5.5)).toBe('5.5 km');
  });

  it('should format sub-km distances in meters', () => {
    expect(formatDistance(0.5)).toBe('500 m');
  });

  it('should format exactly 1 km', () => {
    expect(formatDistance(1)).toBe('1.0 km');
  });

  it('should round meters to nearest whole number', () => {
    expect(formatDistance(0.123)).toBe('123 m');
  });

  it('should handle zero', () => {
    expect(formatDistance(0)).toBe('0 m');
  });
});

describe('formatDuration', () => {
  it('should format minutes under 60', () => {
    expect(formatDuration(45)).toBe('45 min');
  });

  it('should format exact hours', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('should format hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('should format single minute', () => {
    expect(formatDuration(1)).toBe('1 min');
  });

  it('should format zero', () => {
    expect(formatDuration(0)).toBe('0 min');
  });

  it('should format 59 minutes', () => {
    expect(formatDuration(59)).toBe('59 min');
  });

  it('should format 61 minutes', () => {
    expect(formatDuration(61)).toBe('1h 1m');
  });
});

describe('statusLabel', () => {
  it('should return Created for CREATED', () => {
    expect(statusLabel('CREATED')).toBe('Created');
  });

  it('should return Assigned for ASSIGNED', () => {
    expect(statusLabel('ASSIGNED')).toBe('Assigned');
  });

  it('should return En Route for EN_ROUTE', () => {
    expect(statusLabel('EN_ROUTE')).toBe('En Route');
  });

  it('should return In Progress for IN_PROGRESS', () => {
    expect(statusLabel('IN_PROGRESS')).toBe('In Progress');
  });

  it('should return On Hold for ON_HOLD', () => {
    expect(statusLabel('ON_HOLD')).toBe('On Hold');
  });

  it('should return Completed for COMPLETED', () => {
    expect(statusLabel('COMPLETED')).toBe('Completed');
  });

  it('should return Invoiced for INVOICED', () => {
    expect(statusLabel('INVOICED')).toBe('Invoiced');
  });

  it('should return Paid for PAID', () => {
    expect(statusLabel('PAID')).toBe('Paid');
  });

  it('should return Closed for CLOSED', () => {
    expect(statusLabel('CLOSED')).toBe('Closed');
  });
});

describe('priorityLabel', () => {
  it('should return Low for LOW', () => {
    expect(priorityLabel('LOW')).toBe('Low');
  });

  it('should return Medium for MEDIUM', () => {
    expect(priorityLabel('MEDIUM')).toBe('Medium');
  });

  it('should return High for HIGH', () => {
    expect(priorityLabel('HIGH')).toBe('High');
  });

  it('should return Urgent for URGENT', () => {
    expect(priorityLabel('URGENT')).toBe('Urgent');
  });
});
