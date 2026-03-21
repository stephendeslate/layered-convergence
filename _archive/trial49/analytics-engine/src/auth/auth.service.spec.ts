import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TenantsService } from '../tenants/tenants.service';
import { PrismaService } from '../prisma/prisma.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let tenantsService: any;
  let jwtService: any;

  beforeEach(async () => {
    prisma = {
      tenant: {
        findFirst: vi.fn(),
      },
    };
    tenantsService = {
      create: vi.fn().mockResolvedValue({ id: 'tenant-1', name: 'Test', apiKey: 'key-1' }),
    };
    jwtService = {
      sign: vi.fn().mockReturnValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantsService, useValue: tenantsService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register and return token', async () => {
      prisma.tenant.findFirst.mockResolvedValue(null);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.token).toBe('jwt-token');
      expect(result.tenantId).toBe('tenant-1');
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.tenant.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new tenant when tenantId not provided', async () => {
      prisma.tenant.findFirst.mockResolvedValue(null);

      await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(tenantsService.create).toHaveBeenCalledWith({ name: 'New User' });
    });

    it('should not create tenant when tenantId is provided', async () => {
      prisma.tenant.findFirst.mockResolvedValue(null);

      await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        tenantId: 'existing-tenant',
      });

      expect(tenantsService.create).not.toHaveBeenCalled();
    });

    it('should return user info in response', async () => {
      prisma.tenant.findFirst.mockResolvedValue(null);

      const result = await service.register({
        email: 'user@example.com',
        password: 'password123',
        name: 'User',
      });

      expect(result.user.email).toBe('user@example.com');
      expect(result.user.name).toBe('User');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if tenant not found', async () => {
      prisma.tenant.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token on valid login', async () => {
      prisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1', name: 'Test' });

      const result = await service.login({
        email: 'api-key-here',
        password: 'pass',
      });

      expect(result.token).toBe('jwt-token');
    });

    it('should sign JWT with tenantId', async () => {
      prisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1', name: 'Test' });

      await service.login({ email: 'key', password: 'pass' });

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'tenant-1' }),
      );
    });
  });
});
