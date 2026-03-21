import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma.service';

// TRACED: EM-TST-AUTH-001 — Auth service unit tests
describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { create: jest.Mock; findFirst: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { create: jest.fn(), findFirst: jest.fn() },
    };
    jwt = { sign: jest.fn().mockReturnValue('test-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject ADMIN role during registration', async () => {
    await expect(
      service.register('test@test.com', 'password123', 'ADMIN', 'tenant-1'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject invalid role during registration', async () => {
    await expect(
      service.register('test@test.com', 'password123', 'ROOT', 'tenant-1'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw on invalid login credentials', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(
      service.login('nobody@test.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
