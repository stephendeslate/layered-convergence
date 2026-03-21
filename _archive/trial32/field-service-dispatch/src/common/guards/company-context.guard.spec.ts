import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CompanyContextGuard } from './company-context.guard';

describe('CompanyContextGuard', () => {
  const guard = new CompanyContextGuard();

  const createContext = (headers: Record<string, string> = {}, user?: any) => {
    const request = { headers, user, companyId: undefined as any };
    return {
      request,
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };
  };

  it('should set companyId from x-company-id header', () => {
    const ctx = createContext({ 'x-company-id': 'comp-1' });
    expect(guard.canActivate(ctx as any)).toBe(true);
    expect(ctx.request.companyId).toBe('comp-1');
  });

  it('should set companyId from user.companyId', () => {
    const ctx = createContext({}, { companyId: 'comp-2' });
    expect(guard.canActivate(ctx as any)).toBe(true);
    expect(ctx.request.companyId).toBe('comp-2');
  });

  it('should prefer x-company-id header over user.companyId', () => {
    const ctx = createContext({ 'x-company-id': 'comp-1' }, { companyId: 'comp-2' });
    expect(guard.canActivate(ctx as any)).toBe(true);
    expect(ctx.request.companyId).toBe('comp-1');
  });

  it('should throw BadRequestException when no companyId', () => {
    const ctx = createContext({});
    expect(() => guard.canActivate(ctx as any)).toThrow(BadRequestException);
  });
});
