import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('Auth Flow (Integration)', () => {
  let authService: AuthService;

  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };

  const mockJwt = {
    sign: vi.fn().mockReturnValue('jwt-token-value'),
    verify: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    vi.clearAllMocks();
  });

  it('should register, then login with same credentials', async () => {
    // Register
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'new@test.com',
      name: 'New User',
      role: 'BUYER',
      passwordHash: 'hashed',
    });

    const registerResult = await authService.register({
      email: 'new@test.com',
      password: 'password123',
      name: 'New User',
      role: 'BUYER' as never,
    });
    expect(registerResult.token).toBe('jwt-token-value');

    // Login
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'new@test.com',
      name: 'New User',
      role: 'BUYER',
      passwordHash: 'hashed',
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const loginResult = await authService.login({
      email: 'new@test.com',
      password: 'password123',
    });
    expect(loginResult.token).toBe('jwt-token-value');
    expect(loginResult.user.email).toBe('new@test.com');
  });

  it('should reject duplicate registration', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      authService.register({
        email: 'existing@test.com',
        password: 'password123',
        name: 'Dup User',
        role: 'BUYER' as never,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject login with wrong password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      passwordHash: 'hashed',
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      authService.login({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should verify JWT contains correct claims', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'claims@test.com',
      name: 'Claims User',
      role: 'SELLER',
      passwordHash: 'hashed',
    });

    await authService.register({
      email: 'claims@test.com',
      password: 'password123',
      name: 'Claims User',
      role: 'SELLER' as never,
    });

    expect(mockJwt.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'claims@test.com',
      role: 'SELLER',
    });
  });
});
