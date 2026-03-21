import { UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';

const mockPrisma = {
  tenant: {
    findUnique: vi.fn(),
  },
};

function createMockContext(headers: Record<string, string> = {}, query: Record<string, string> = {}) {
  const request = { headers, query, tenant: undefined, tenantId: undefined };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    request,
  };
}

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;

  beforeEach(() => {
    guard = new ApiKeyGuard(mockPrisma as any);
    vi.clearAllMocks();
  });

  it('should allow request with valid api key in header', async () => {
    const tenant = { id: 't1', apiKey: 'valid-key' };
    mockPrisma.tenant.findUnique.mockResolvedValue(tenant);
    const ctx = createMockContext({ 'x-api-key': 'valid-key' });
    const result = await guard.canActivate(ctx as any);
    expect(result).toBe(true);
    expect(ctx.request.tenant).toEqual(tenant);
    expect(ctx.request.tenantId).toBe('t1');
  });

  it('should allow request with valid api key in query', async () => {
    const tenant = { id: 't1', apiKey: 'valid-key' };
    mockPrisma.tenant.findUnique.mockResolvedValue(tenant);
    const ctx = createMockContext({}, { apiKey: 'valid-key' });
    const result = await guard.canActivate(ctx as any);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when no api key provided', async () => {
    const ctx = createMockContext();
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid api key', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValue(null);
    const ctx = createMockContext({ 'x-api-key': 'invalid' });
    await expect(guard.canActivate(ctx as any)).rejects.toThrow(UnauthorizedException);
  });
});
