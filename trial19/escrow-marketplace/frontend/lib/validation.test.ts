import { describe, it, expect } from 'vitest';
import { validateRequiredString, validateOptionalString, validateRequiredNumber } from './validation';

describe('validateRequiredString', () => {
  it('should return trimmed string value', () => {
    const formData = new FormData();
    formData.set('name', '  hello  ');
    expect(validateRequiredString(formData, 'name')).toBe('hello');
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
  it('should return trimmed value', () => {
    const formData = new FormData();
    formData.set('desc', ' test ');
    expect(validateOptionalString(formData, 'desc')).toBe('test');
  });

  it('should return undefined for empty', () => {
    const formData = new FormData();
    formData.set('desc', '');
    expect(validateOptionalString(formData, 'desc')).toBeUndefined();
  });

  it('should return undefined for missing', () => {
    const formData = new FormData();
    expect(validateOptionalString(formData, 'desc')).toBeUndefined();
  });
});

describe('validateRequiredNumber', () => {
  it('should return numeric value', () => {
    const formData = new FormData();
    formData.set('amount', '42.50');
    expect(validateRequiredNumber(formData, 'amount')).toBe(42.5);
  });

  it('should throw for NaN', () => {
    const formData = new FormData();
    formData.set('amount', 'abc');
    expect(() => validateRequiredNumber(formData, 'amount')).toThrow('must be a valid number');
  });

  it('should throw for missing field', () => {
    const formData = new FormData();
    expect(() => validateRequiredNumber(formData, 'amount')).toThrow('amount is required');
  });
});
