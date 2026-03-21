import { describe, it, expect, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';

function createMockPrisma(tenantExists = true) {
  return {
    tenant: {
      findUnique: async (args: any) =>
        tenantExists && args.where.apiKey === 'valid-key'
          ? { id: 'tenant-1', apiKey: 'valid-key' }
          : null,
    },
  } as any;
}

function createMockContext(headers: Record<string, string> = {}, query: Record<string, string> = {}) {
  const request = { headers, query, tenant: undefined as any, tenantId: undefined as any };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    _request: request,
  } as any;
}

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;

  beforeEach(() => {
    guard = new ApiKeyGuard(createMockPrisma());
  });

  it('should allow request with valid API key in header', async () => {
    const ctx = createMockContext({ 'x-api-key': 'valid-key' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should set tenant on request', async () => {
    const ctx = createMockContext({ 'x-api-key': 'valid-key' });
    await guard.canActivate(ctx);
    expect(ctx._request.tenantId).toBe('tenant-1');
  });

  it('should allow request with valid API key in query', async () => {
    const ctx = createMockContext({}, { apiKey: 'valid-key' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should throw for missing API key', async () => {
    const ctx = createMockContext();
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw for invalid API key', async () => {
    const ctx = createMockContext({ 'x-api-key': 'bad-key' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw with message for missing key', async () => {
    const ctx = createMockContext();
    await expect(guard.canActivate(ctx)).rejects.toThrow('API key is required');
  });

  it('should throw with message for invalid key', async () => {
    const ctx = createMockContext({ 'x-api-key': 'bad' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Invalid API key');
  });
});
