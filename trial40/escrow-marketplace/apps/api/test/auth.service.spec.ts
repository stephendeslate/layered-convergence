// TRACED: EM-TEST-001 — Auth service unit tests
import { AuthService } from '../src/auth/auth.service';
import { BCRYPT_SALT_ROUNDS } from '@escrow-marketplace/shared';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrismaService: Record<string, unknown>;
  let mockJwtService: Record<string, unknown>;

  beforeEach(() => {
    mockPrismaService = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };
    authService = new AuthService(
      mockPrismaService as never,
      mockJwtService as never,
    );
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should use BCRYPT_SALT_ROUNDS constant of 12', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should reject registration with duplicate email', async () => {
    (mockPrismaService.user as Record<string, jest.Mock>).findFirst.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });

    await expect(
      authService.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: 'BUYER',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Email already registered for this tenant');
  });

  it('should reject login with invalid credentials', async () => {
    (mockPrismaService.user as Record<string, jest.Mock>).findFirst.mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'nonexistent@test.com',
        password: 'password',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should validate user by ID', async () => {
    (mockPrismaService.user as Record<string, jest.Mock>).findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      role: 'BUYER',
      tenantId: 'tenant-1',
    });

    const result = await authService.validateUser('user-1');
    expect(result).toEqual({
      id: 'user-1',
      email: 'test@test.com',
      role: 'BUYER',
      tenantId: 'tenant-1',
    });
  });
});
