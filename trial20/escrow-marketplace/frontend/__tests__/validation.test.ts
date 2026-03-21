import { validateRequiredString, validateRequiredNumber } from '../lib/validation';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Validation Helpers', () => {
  describe('validateRequiredString', () => {
    it('returns trimmed string for valid input', () => {
      const formData = new FormData();
      formData.set('name', '  John Doe  ');
      expect(validateRequiredString(formData, 'name')).toBe('John Doe');
    });

    it('returns null for empty string', () => {
      const formData = new FormData();
      formData.set('name', '  ');
      expect(validateRequiredString(formData, 'name')).toBeNull();
    });

    it('returns null for missing field', () => {
      const formData = new FormData();
      expect(validateRequiredString(formData, 'name')).toBeNull();
    });

    it('returns null for non-string value', () => {
      const formData = new FormData();
      formData.set('file', new Blob(['test']));
      expect(validateRequiredString(formData, 'file')).toBeNull();
    });
  });

  describe('validateRequiredNumber', () => {
    it('returns number for valid numeric string', () => {
      const formData = new FormData();
      formData.set('amount', '123.45');
      expect(validateRequiredNumber(formData, 'amount')).toBe(123.45);
    });

    it('returns null for non-numeric string', () => {
      const formData = new FormData();
      formData.set('amount', 'abc');
      expect(validateRequiredNumber(formData, 'amount')).toBeNull();
    });

    it('returns null for empty string', () => {
      const formData = new FormData();
      formData.set('amount', '');
      expect(validateRequiredNumber(formData, 'amount')).toBeNull();
    });

    it('returns null for missing field', () => {
      const formData = new FormData();
      expect(validateRequiredNumber(formData, 'amount')).toBeNull();
    });

    it('returns 0 for zero value', () => {
      const formData = new FormData();
      formData.set('amount', '0');
      expect(validateRequiredNumber(formData, 'amount')).toBe(0);
    });
  });
});
