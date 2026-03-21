import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

// [TRACED:TS-005] Integration tests using NestJS service layer with real database
describe('AuthService (integration)', () => {
  let module: TestingModule;
  let authService: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.webhook.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should register a buyer and return token + user', async () => {
    const result = await authService.register({
      email: 'buyer@integration.test',
      password: 'securePass123',
      role: Role.BUYER,
    });

    expect(result.token).toBeDefined();
    expect(result.user).toEqual({
      id: expect.any(String),
      email: 'buyer@integration.test',
      role: Role.BUYER,
    });
  });

  it('should register a seller', async () => {
    const result = await authService.register({
      email: 'seller@integration.test',
      password: 'securePass123',
      role: Role.SELLER,
    });

    expect(result.user.role).toBe(Role.SELLER);
  });

  it('should reject duplicate email registration', async () => {
    await authService.register({
      email: 'dupe@integration.test',
      password: 'securePass123',
      role: Role.BUYER,
    });

    await expect(
      authService.register({
        email: 'dupe@integration.test',
        password: 'securePass123',
        role: Role.BUYER,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should login with correct credentials', async () => {
    await authService.register({
      email: 'login@integration.test',
      password: 'securePass123',
      role: Role.BUYER,
    });

    const result = await authService.login({
      email: 'login@integration.test',
      password: 'securePass123',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('login@integration.test');
  });

  it('should reject login with wrong password', async () => {
    await authService.register({
      email: 'wrongpw@integration.test',
      password: 'securePass123',
      role: Role.BUYER,
    });

    await expect(
      authService.login({
        email: 'wrongpw@integration.test',
        password: 'wrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
