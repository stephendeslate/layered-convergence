import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CompanyContextGuard } from './company-context.guard';

describe('CompanyContextGuard', () => {
  let guard: CompanyContextGuard;

  beforeEach(() => {
    guard = new CompanyContextGuard();
  });

  const createContext = (headers: Record<string, string> = {}, user?: any) => {
    const request = { headers, user, companyId: undefined as any };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      _request: request,
    } as any;
  };

  it('should set companyId from x-company-id header', () => {
    const ctx = createContext({ 'x-company-id': 'comp1' });
    expect(guard.canActivate(ctx)).toBe(true);
    expect(ctx._request.companyId).toBe('comp1');
  });

  it('should set companyId from user.companyId', () => {
    const ctx = createContext({}, { companyId: 'comp2' });
    expect(guard.canActivate(ctx)).toBe(true);
    expect(ctx._request.companyId).toBe('comp2');
  });

  it('should prefer header over user.companyId', () => {
    const ctx = createContext({ 'x-company-id': 'comp1' }, { companyId: 'comp2' });
    expect(guard.canActivate(ctx)).toBe(true);
    expect(ctx._request.companyId).toBe('comp1');
  });

  it('should throw BadRequestException when no companyId available', () => {
    const ctx = createContext({});
    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
  });
});
