// TRACED:EM-TEST-02 auth service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw on login with non-existent user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    await expect(
      service.login({ email: 'none@example.com', password: 'password' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw ConflictException when email exists', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(
      service.register({
        email: 'existing@example.com',
        password: 'password123',
        role: 'BUYER',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Email already registered');
  });
});
