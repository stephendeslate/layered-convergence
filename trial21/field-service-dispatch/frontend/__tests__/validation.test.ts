import { validateRequiredString, validateRequiredNumber } from '@/lib/validation';

describe('validateRequiredString', () => {
  it('returns trimmed string for valid input', () => {
    const fd = new FormData();
    fd.set('name', '  Alice  ');
    expect(validateRequiredString(fd, 'name')).toBe('Alice');
  });

  it('returns null for empty string', () => {
    const fd = new FormData();
    fd.set('name', '   ');
    expect(validateRequiredString(fd, 'name')).toBeNull();
  });

  it('returns null for missing field', () => {
    const fd = new FormData();
    expect(validateRequiredString(fd, 'name')).toBeNull();
  });

  it('returns null for File input', () => {
    const fd = new FormData();
    fd.set('name', new Blob(['test']) as File);
    expect(validateRequiredString(fd, 'name')).toBeNull();
  });
});

describe('validateRequiredNumber', () => {
  it('returns number for valid numeric string', () => {
    const fd = new FormData();
    fd.set('amount', '42.5');
    expect(validateRequiredNumber(fd, 'amount')).toBe(42.5);
  });

  it('returns null for non-numeric string', () => {
    const fd = new FormData();
    fd.set('amount', 'abc');
    expect(validateRequiredNumber(fd, 'amount')).toBeNull();
  });

  it('returns null for empty string', () => {
    const fd = new FormData();
    fd.set('amount', '');
    expect(validateRequiredNumber(fd, 'amount')).toBeNull();
  });

  it('returns null for missing field', () => {
    const fd = new FormData();
    expect(validateRequiredNumber(fd, 'amount')).toBeNull();
  });

  it('returns 0 for zero input', () => {
    const fd = new FormData();
    fd.set('amount', '0');
    expect(validateRequiredNumber(fd, 'amount')).toBe(0);
  });
});
