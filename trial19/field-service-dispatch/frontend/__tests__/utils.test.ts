import { describe, it, expect } from 'vitest';
import {
  validateRequiredString,
  validateOptionalString,
  getStatusBadgeVariant,
  getAvailabilityBadgeVariant,
  formatDate,
  formatStatus,
} from '@/lib/utils';

describe('validateRequiredString', () => {
  it('should return trimmed value for valid input', () => {
    const formData = new FormData();
    formData.set('name', '  John  ');
    expect(validateRequiredString(formData, 'name')).toBe('John');
  });

  it('should throw for missing field', () => {
    const formData = new FormData();
    expect(() => validateRequiredString(formData, 'missing')).toThrow('missing is required');
  });

  it('should throw for empty string', () => {
    const formData = new FormData();
    formData.set('name', '   ');
    expect(() => validateRequiredString(formData, 'name')).toThrow('name is required');
  });
});

describe('validateOptionalString', () => {
  it('should return trimmed value when present', () => {
    const formData = new FormData();
    formData.set('field', '  value  ');
    expect(validateOptionalString(formData, 'field')).toBe('value');
  });

  it('should return undefined when field is missing', () => {
    const formData = new FormData();
    expect(validateOptionalString(formData, 'missing')).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    const formData = new FormData();
    formData.set('field', '   ');
    expect(validateOptionalString(formData, 'field')).toBeUndefined();
  });
});

describe('getStatusBadgeVariant', () => {
  it('should return correct variant for each status', () => {
    expect(getStatusBadgeVariant('PENDING')).toBe('pending');
    expect(getStatusBadgeVariant('ASSIGNED')).toBe('assigned');
    expect(getStatusBadgeVariant('IN_PROGRESS')).toBe('inProgress');
    expect(getStatusBadgeVariant('ON_HOLD')).toBe('onHold');
    expect(getStatusBadgeVariant('COMPLETED')).toBe('completed');
    expect(getStatusBadgeVariant('INVOICED')).toBe('invoiced');
    expect(getStatusBadgeVariant('UNKNOWN')).toBe('default');
  });
});

describe('getAvailabilityBadgeVariant', () => {
  it('should return correct variant for each availability', () => {
    expect(getAvailabilityBadgeVariant('AVAILABLE')).toBe('available');
    expect(getAvailabilityBadgeVariant('ON_JOB')).toBe('onJob');
    expect(getAvailabilityBadgeVariant('OFF_DUTY')).toBe('offDuty');
    expect(getAvailabilityBadgeVariant('UNKNOWN')).toBe('default');
  });
});

describe('formatDate', () => {
  it('should return N/A for null', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  it('should format valid date string', () => {
    const result = formatDate('2026-03-21T10:30:00Z');
    expect(result).toContain('2026');
  });
});

describe('formatStatus', () => {
  it('should replace underscores with spaces', () => {
    expect(formatStatus('IN_PROGRESS')).toBe('IN PROGRESS');
    expect(formatStatus('ON_HOLD')).toBe('ON HOLD');
    expect(formatStatus('PENDING')).toBe('PENDING');
  });
});
