import { describe, it, expect, vi } from 'vitest';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { CompanyContextGuard } from './company-context.guard';

function createMockContext(headers: Record<string, string>, user?: any): ExecutionContext {
  const request = { headers, user } as any;

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('CompanyContextGuard', () => {
  const guard = new CompanyContextGuard();

  it('should allow request with x-company-id header', () => {
    const ctx = createMockContext({ 'x-company-id': 'comp-1' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should set companyId on request', () => {
    const request = { headers: { 'x-company-id': 'comp-1' } } as any;
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    guard.canActivate(ctx);
    expect(request.companyId).toBe('comp-1');
  });

  it('should allow request with user.companyId', () => {
    const ctx = createMockContext({}, { companyId: 'comp-2' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw BadRequestException when no company context', () => {
    const ctx = createMockContext({});
    expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
  });

  it('should prefer x-company-id header over user.companyId', () => {
    const request = {
      headers: { 'x-company-id': 'header-comp' },
      user: { companyId: 'user-comp' },
    } as any;
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    guard.canActivate(ctx);
    expect(request.companyId).toBe('header-comp');
  });
});
