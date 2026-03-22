import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@field-service-dispatch/shared';

// TRACED: FD-AUTH-UNIT-TEST
describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { create: jest.Mock; findFirst: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn() };

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

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        role: 'USER',
        tenantId: 'tenant-1',
        createdAt: new Date(),
      });

      const result = await service.register(
        'test@test.com',
        'password123',
        'USER',
        'tenant-1',
      );

      expect(result.email).toBe('test@test.com');
      expect(prisma.user.create).toHaveBeenCalled();
      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.passwordHash).toBeDefined();
      expect(createCall.data.passwordHash).not.toBe('password123');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login('wrong@test.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: hash,
        role: 'USER',
        tenantId: 'tenant-1',
      });
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login('test@test.com', 'password123');

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.email).toBe('test@test.com');
    });
  });
});
