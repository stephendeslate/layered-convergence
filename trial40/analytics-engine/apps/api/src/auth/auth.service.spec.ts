// TRACED:AE-TEST-01 — Auth service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw ConflictException when email exists on register', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: '1' });

    await expect(
      service.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        role: 'EDITOR',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException for invalid credentials on login', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.login({ email: 'wrong@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return access_token on successful registration', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      role: 'EDITOR',
      tenantId: 'tenant-1',
    });

    const result = await service.register({
      email: 'test@test.com',
      password: 'password123',
      name: 'Test',
      role: 'EDITOR',
      tenantId: 'tenant-1',
    });

    expect(result).toHaveProperty('access_token');
    expect(jwtService.sign).toHaveBeenCalled();
  });
});
