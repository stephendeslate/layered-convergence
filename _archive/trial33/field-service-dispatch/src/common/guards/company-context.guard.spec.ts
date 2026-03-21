import { describe, it, expect, beforeEach } from 'vitest';
import { CompanyContextGuard } from './company-context.guard';
import { ExecutionContext, BadRequestException } from '@nestjs/common';

describe('CompanyContextGuard', () => {
  let guard: CompanyContextGuard;

  function createContext(headers: Record<string, string> = {}, user?: any): ExecutionContext {
    const request = { headers, user, companyId: undefined as any };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    guard = new CompanyContextGuard();
  });

  it('should allow access when x-company-id header is present', () => {
    const context = createContext({ 'x-company-id': 'company-1' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should set companyId on request from header', () => {
    const request = { headers: { 'x-company-id': 'company-1' }, user: undefined, companyId: undefined as any };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    guard.canActivate(context);
    expect(request.companyId).toBe('company-1');
  });

  it('should fall back to user.companyId when header is missing', () => {
    const request = {
      headers: {},
      user: { companyId: 'company-2' },
      companyId: undefined as any,
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
    expect(request.companyId).toBe('company-2');
  });

  it('should throw BadRequestException when no company context', () => {
    const context = createContext({});
    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it('should throw with descriptive message', () => {
    const context = createContext({});
    expect(() => guard.canActivate(context)).toThrow(
      'x-company-id header is required for tenant isolation',
    );
  });
});
