import { describe, it, expect } from 'vitest';
import { validateRequiredString, validateOptionalString, getStatusColor, formatDate } from '@/lib/utils';

describe('validateRequiredString', () => {
  it('should return trimmed value for valid string', () => {
    const formData = new FormData();
    formData.set('name', '  John  ');
    expect(validateRequiredString(formData, 'name')).toBe('John');
  });

  it('should throw for empty string', () => {
    const formData = new FormData();
    formData.set('name', '   ');
    expect(() => validateRequiredString(formData, 'name')).toThrow('name is required');
  });

  it('should throw for missing field', () => {
    const formData = new FormData();
    expect(() => validateRequiredString(formData, 'name')).toThrow('name is required');
  });
});

describe('validateOptionalString', () => {
  it('should return trimmed value for non-empty string', () => {
    const formData = new FormData();
    formData.set('name', ' Jane ');
    expect(validateOptionalString(formData, 'name')).toBe('Jane');
  });

  it('should return undefined for empty string', () => {
    const formData = new FormData();
    formData.set('name', '');
    expect(validateOptionalString(formData, 'name')).toBeUndefined();
  });

  it('should return undefined for missing field', () => {
    const formData = new FormData();
    expect(validateOptionalString(formData, 'name')).toBeUndefined();
  });
});

describe('getStatusColor', () => {
  it('should return correct color for PENDING', () => {
    expect(getStatusColor('PENDING')).toContain('yellow');
  });

  it('should return correct color for COMPLETED', () => {
    expect(getStatusColor('COMPLETED')).toContain('green');
  });

  it('should return default color for unknown status', () => {
    expect(getStatusColor('UNKNOWN')).toContain('gray');
  });
});

describe('formatDate', () => {
  it('should return N/A for null', () => {
    expect(formatDate(null)).toBe('N/A');
  });

  it('should format a valid date string', () => {
    const result = formatDate('2026-03-21T10:30:00Z');
    expect(result).toBeTruthy();
    expect(result).not.toBe('N/A');
  });
});
