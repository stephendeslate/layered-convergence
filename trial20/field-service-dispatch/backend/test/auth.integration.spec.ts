import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('AuthService (integration)', () => {
  let module: TestingModule;
  let authService: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [AuthService, PrismaService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('register flow', () => {
    it('should return token and user with correct field names', async () => {
      const mockFindUnique = jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const mockCompanyFind = jest.spyOn(prisma.company, 'findUnique').mockResolvedValue(null);
      const mockCompanyCreate = jest.spyOn(prisma.company, 'create').mockResolvedValue({
        id: 'company-int-1',
        name: 'Integration Co',
        slug: 'integration-co',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const mockUserCreate = jest.spyOn(prisma.user, 'create').mockResolvedValue({
        id: 'user-int-1',
        email: 'integration@test.com',
        passwordHash: 'hashed',
        role: Role.DISPATCHER,
        companyId: 'company-int-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.register({
        email: 'integration@test.com',
        password: 'password123',
        role: Role.DISPATCHER,
        companySlug: 'integration-co',
        companyName: 'Integration Co',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('companyId');
      expect(typeof result.token).toBe('string');
      expect(result.user.role).toBe(Role.DISPATCHER);

      mockFindUnique.mockRestore();
      mockCompanyFind.mockRestore();
      mockCompanyCreate.mockRestore();
      mockUserCreate.mockRestore();
    });
  });

  describe('login flow', () => {
    it('should authenticate with correct credentials', async () => {
      const bcrypt = require('bcrypt');
      const hashed = await bcrypt.hash('password123', 12);

      const mockFindUnique = jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'user-int-2',
        email: 'login@test.com',
        passwordHash: hashed,
        role: Role.TECHNICIAN,
        companyId: 'company-int-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.login({
        email: 'login@test.com',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('login@test.com');
      expect(result.user.role).toBe(Role.TECHNICIAN);

      mockFindUnique.mockRestore();
    });
  });
});
