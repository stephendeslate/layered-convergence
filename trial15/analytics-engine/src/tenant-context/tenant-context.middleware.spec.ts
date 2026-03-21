import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantContextMiddleware } from './tenant-context.middleware';
import { AuthService } from '../auth/auth.service';
import { Request, Response, NextFunction } from 'express';

describe('TenantContextMiddleware', () => {
  let middleware: TenantContextMiddleware;
  let authService: AuthService;
  let mockNext: NextFunction;
  let mockRes: Response;

  beforeEach(() => {
    authService = {
      extractTokenFromHeader: vi.fn(),
      verify: vi.fn(),
    } as any;
    middleware = new TenantContextMiddleware(authService);
    mockNext = vi.fn();
    mockRes = {} as Response;
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should extract tenantId from x-tenant-id header', () => {
    const req = {
      headers: { 'x-tenant-id': 'tenant-from-header' },
    } as unknown as Request;

    middleware.use(req, mockRes, mockNext);

    expect(req.tenantId).toBe('tenant-from-header');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should prefer x-tenant-id header over JWT', () => {
    const req = {
      headers: {
        'x-tenant-id': 'tenant-from-header',
        authorization: 'Bearer some-token',
      },
    } as unknown as Request;

    middleware.use(req, mockRes, mockNext);

    expect(req.tenantId).toBe('tenant-from-header');
    expect(authService.extractTokenFromHeader).not.toHaveBeenCalled();
  });

  it('should extract tenantId from JWT when no header is present', () => {
    const req = {
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as Request;

    vi.mocked(authService.extractTokenFromHeader).mockReturnValue('valid-token');
    vi.mocked(authService.verify).mockReturnValue({
      sub: 'user-1',
      email: 'test@example.com',
      tenantId: 'tenant-from-jwt',
      role: 'admin',
    });

    middleware.use(req, mockRes, mockNext);

    expect(req.tenantId).toBe('tenant-from-jwt');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should leave tenantId undefined when no header and no valid JWT', () => {
    const req = {
      headers: {},
    } as unknown as Request;

    vi.mocked(authService.extractTokenFromHeader).mockReturnValue(null);

    middleware.use(req, mockRes, mockNext);

    expect(req.tenantId).toBeUndefined();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should leave tenantId undefined when JWT verification fails', () => {
    const req = {
      headers: { authorization: 'Bearer bad-token' },
    } as unknown as Request;

    vi.mocked(authService.extractTokenFromHeader).mockReturnValue('bad-token');
    vi.mocked(authService.verify).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    middleware.use(req, mockRes, mockNext);

    expect(req.tenantId).toBeUndefined();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should always call next()', () => {
    const req = { headers: {} } as unknown as Request;
    vi.mocked(authService.extractTokenFromHeader).mockReturnValue(null);

    middleware.use(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
